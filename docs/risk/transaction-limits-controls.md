# Cahier des charges — Limites transactionnelles, contrôles de vélocité et garde-fous opérationnels

## 1. Objet

Ce document définit les exigences Mansa relatives aux plafonds transactionnels, limites de fréquence, contrôles de vélocité, restrictions contextuelles, garde-fous de sécurité et politiques de blocage appliquées aux opérations financières et sensibles.

L’objectif est de permettre à Mansa de limiter le risque financier, la fraude, les abus, les erreurs opérationnelles, les attaques automatisées et les dépassements réglementaires sans empêcher inutilement les usages légitimes.

Le moteur de limites doit être centralisé, configurable, auditable, multi-tenant, multi-pays, compatible offline lorsque cela est nécessaire et indépendant des canaux clients.

Il doit s’appliquer au minimum aux paiements, transferts, retraits, dépôts, recharges, cash-in/cash-out agents, cartes, Mobile Money, QR, wallets, opérations commerçants, services État, péages, factures, transferts internationaux et actions administratives sensibles.

## 2. Principes directeurs

Le moteur doit respecter les principes suivants :

1. aucun plafond critique ne doit être codé en dur dans une application cliente ;
2. les limites doivent être évaluées côté serveur ou dans un moteur local sécurisé explicitement autorisé ;
3. les règles réglementaires priment sur les préférences commerciales ;
4. plusieurs limites peuvent s’appliquer simultanément à une même opération ;
5. la limite la plus restrictive applicable doit prévaloir sauf règle de priorité explicitement définie ;
6. toute modification de limite sensible doit être auditée ;
7. aucune limite ne doit pouvoir être désactivée silencieusement ;
8. les exemptions doivent être explicites, temporaires si possible et approuvées selon le niveau de risque ;
9. les décisions doivent être explicables après coup ;
10. les règles doivent être cohérentes entre API, mobile, web, TPE, borne, agent et traitement batch.

## 3. Terminologie

```text
Limit = plafond ou seuil applicable à une opération
Velocity = nombre ou montant cumulé sur une fenêtre temporelle
Hard Limit = blocage obligatoire
Soft Limit = déclenchement d’avertissement, revue ou étape supplémentaire
Counter = compteur associé à une règle
Scope = périmètre d’application d’une règle
Override = dérogation contrôlée
Cooldown = période d’attente après certains événements
Risk Step-Up = contrôle supplémentaire déclenché par risque
``` 

## 4. Types de limites

Le système doit supporter au minimum :

```text
PER_TRANSACTION_AMOUNT
DAILY_AMOUNT
WEEKLY_AMOUNT
MONTHLY_AMOUNT
DAILY_COUNT
HOURLY_COUNT
ROLLING_WINDOW_AMOUNT
ROLLING_WINDOW_COUNT
BALANCE_MAXIMUM
CASH_IN_LIMIT
CASH_OUT_LIMIT
WITHDRAWAL_LIMIT
DEPOSIT_LIMIT
CARD_PURCHASE_LIMIT
CONTACTLESS_LIMIT
TRANSFER_LIMIT
P2P_LIMIT
MERCHANT_PAYMENT_LIMIT
AGENT_OPERATION_LIMIT
INTERNATIONAL_TRANSFER_LIMIT
FX_LIMIT
TOPUP_LIMIT
BILL_PAYMENT_LIMIT
PUBLIC_SERVICE_PAYMENT_LIMIT
TOLL_PAYMENT_LIMIT
REFUND_LIMIT
REVERSAL_LIMIT
MANUAL_ADJUSTMENT_LIMIT
ADMIN_ACTION_LIMIT
``` 

## 5. Fenêtres temporelles

Les limites de vélocité doivent supporter :

- minute glissante ;
- 5 minutes ;
- 15 minutes ;
- heure glissante ;
- jour civil local ;
- 24 heures glissantes ;
- semaine civile ;
- 7 jours glissants ;
- mois civil ;
- 30 jours glissants ;
- période personnalisée autorisée.

Les fenêtres civiles doivent utiliser le fuseau horaire de référence du pays ou de l’organisation concernée.

## 6. Scopes de règles

Une règle peut être définie au niveau :

```text
GLOBAL
COUNTRY
REGULATORY_PROFILE
ORGANIZATION
TENANT
PRODUCT
CHANNEL
USER_SEGMENT
USER
WALLET
ACCOUNT
CARD
MERCHANT
AGENT
DEVICE
TERMINAL
TOLL_NETWORK
TOLL_SITE
TOLL_LANE
PUBLIC_SERVICE
PARTNER
CURRENCY
TRANSACTION_TYPE
``` 

Le moteur doit être capable de composer plusieurs scopes sur une même décision.

## 7. Hiérarchie des règles

La priorité recommandée est :

1. règle légale ou réglementaire ;
2. règle sécurité/fraude globale ;
3. règle pays ;
4. règle partenaire obligatoire ;
5. règle produit ;
6. règle organisation ;
7. règle segment ;
8. règle utilisateur ou compte ;
9. préférence utilisateur plus restrictive.

Une règle commerciale ne doit jamais augmenter une limite au-delà d’un plafond réglementaire.

## 8. Modèle de données minimal

Entités recommandées :

```text
LimitPolicy
LimitRule
LimitScope
LimitCounter
LimitDecision
LimitOverride
LimitApproval
LimitBreachEvent
VelocityWindow
RiskStepUpRule
UserLimitPreference
RegulatoryLimitProfile
PartnerLimitProfile
LimitChangeRequest
LimitAuditEvent
``` 

## 9. LimitPolicy

Une `LimitPolicy` représente un ensemble cohérent de règles.

Champs minimaux :

```text
id
name
description
countryCode
organizationId
status
priority
validFrom
validUntil
createdBy
approvedBy
version
``` 

États possibles :

```text
DRAFT
REVIEW
APPROVED
ACTIVE
SUSPENDED
EXPIRED
RETIRED
``` 

## 10. LimitRule

Chaque règle doit contenir au minimum :

```text
ruleType
transactionType
currency
amountLimit
countLimit
windowType
windowSize
scopeType
scopeId
hardOrSoft
actionOnBreach
priority
riskLevel
validFrom
validUntil
``` 

## 11. Actions en cas de dépassement

Le moteur doit pouvoir répondre :

```text
ALLOW
ALLOW_WITH_WARNING
REQUIRE_STEP_UP
REQUIRE_MFA
REQUIRE_AGENT_REVIEW
REQUIRE_COMPLIANCE_REVIEW
DELAY
HOLD
DECLINE
BLOCK_TEMPORARILY
BLOCK_UNTIL_REVIEW
``` 

L’action doit être déterministe et journalisée.

## 12. Évaluation avant transaction

Avant toute opération sensible :

1. identifier le sujet principal ;
2. identifier produit, canal, pays, devise, partenaire et tenant ;
3. charger les politiques applicables ;
4. lire les compteurs nécessaires ;
5. calculer les limites restantes ;
6. appliquer le moteur de risque si requis ;
7. produire une décision ;
8. réserver le montant ou la capacité si nécessaire ;
9. continuer ou bloquer l’opération.

## 13. Réservation de capacité

Pour éviter les dépassements concurrents, les opérations simultanées doivent pouvoir réserver temporairement une partie de la limite.

Exemple : deux paiements de 80 000 FCFA lancés simultanément ne doivent pas tous deux passer si le plafond restant est 100 000 FCFA.

Mécanismes possibles :

- transaction atomique ;
- verrou distribué ;
- compteur atomique ;
- réservation avec expiration ;
- sérialisation par compte lorsque nécessaire.

## 14. Validation après transaction

Après succès :

- confirmer la réservation ;
- incrémenter les compteurs définitifs ;
- enregistrer la décision ;
- publier les événements nécessaires ;
- mettre à jour les projections de limite restante.

Après échec :

- libérer la réservation ;
- ne pas consommer la limite sauf règle spécifique ;
- conserver l’événement si la tentative elle-même est un signal de risque.

## 15. Retours, annulations et reversals

Les remboursements et annulations doivent disposer de règles explicites.

Le système doit distinguer :

```text
FAILED_BEFORE_AUTHORIZATION
AUTHORIZED_NOT_CAPTURED
CAPTURED
REVERSED
REFUNDED_PARTIAL
REFUNDED_FULL
CHARGEBACK
``` 

Un remboursement ne doit pas automatiquement restaurer tous les compteurs de vélocité si cela ouvre un mécanisme de contournement.

## 16. Tentatives refusées

Les tentatives refusées peuvent alimenter des compteurs séparés :

```text
DECLINED_COUNT
FAILED_AUTH_COUNT
INVALID_PIN_COUNT
INVALID_OTP_COUNT
CARD_DECLINE_COUNT
CASHOUT_DECLINE_COUNT
``` 

Un volume anormal de tentatives peut entraîner un cooldown ou une revue.

## 17. Limites utilisateur

Les utilisateurs peuvent recevoir des limites selon :

- niveau KYC ;
- âge ;
- pays ;
- historique du compte ;
- score de risque ;
- ancienneté ;
- produit ;
- catégorie réglementaire ;
- statut du compte.

Exemple de niveaux :

```text
UNVERIFIED
BASIC_KYC
STANDARD_KYC
ENHANCED_KYC
BUSINESS_VERIFIED
INSTITUTIONAL
``` 

## 18. Limites choisies par l’utilisateur

Mansa peut permettre à l’utilisateur de réduire ses propres limites pour plus de sécurité.

Exemples :

- plafond quotidien de carte ;
- plafond de retrait ;
- plafond de paiement en ligne ;
- désactivation internationale ;
- désactivation sans contact ;
- plafond de transfert P2P.

Une préférence utilisateur ne doit jamais dépasser la limite système maximale.

## 19. Augmentation de limite

Une augmentation peut exiger :

- KYC renforcé ;
- justification ;
- document supplémentaire ;
- ancienneté minimale ;
- analyse de risque ;
- approbation opérateur ;
- délai de sécurité.

Les augmentations sensibles doivent être auditées.

## 20. Cooldown après modification

Pour certaines limites sensibles, une augmentation ne doit pas prendre effet immédiatement.

Exemple :

```text
CARD_DAILY_LIMIT increase
-> confirmation forte
-> délai configurable
-> notification utilisateur
-> prise d’effet
``` 

La réduction d’une limite peut être immédiate.

## 21. Limites cartes

Le moteur doit gérer séparément :

- paiement physique ;
- paiement e-commerce ;
- NFC/contactless ;
- retrait ATM ;
- paiement international ;
- paiement domestique ;
- recurring/card-on-file ;
- wallet tokenisé ;
- carte virtuelle ;
- carte temporaire.

## 22. Limites sans contact

Le sans contact doit pouvoir appliquer :

- plafond par transaction ;
- cumul sans authentification renforcée ;
- compteur de transactions successives ;
- obligation de PIN ou étape forte après seuil.

Les paramètres dépendent du programme carte, de l’acquéreur et des règles applicables.

## 23. Limites P2P

Les transferts entre utilisateurs doivent pouvoir limiter :

- montant par transfert ;
- montant journalier ;
- nombre de bénéficiaires nouveaux ;
- montant vers nouveaux bénéficiaires ;
- nombre de transferts par heure ;
- concentration vers un même destinataire.

## 24. Nouveaux bénéficiaires

Le système peut appliquer des restrictions spécifiques pendant une période initiale :

```text
NEW_BENEFICIARY_COOLDOWN
NEW_BENEFICIARY_AMOUNT_LIMIT
NEW_BENEFICIARY_DAILY_COUNT
``` 

L’objectif est de réduire le risque de prise de contrôle de compte.

## 25. Limites agents

Pour les agents cash-in/cash-out :

- plafond par opération ;
- plafond par jour ;
- plafond de caisse ;
- exposition maximale ;
- limite de retraits consécutifs ;
- limite selon niveau d’agent ;
- limite selon localisation ;
- limite selon terminal.

Les commissions ne doivent pas permettre de contourner les limites.

## 26. Limites commerçants

Les commerçants doivent pouvoir avoir :

- plafond de transaction ;
- plafond de remboursement ;
- plafond manuel ;
- plafond de paiement sans présence du client ;
- plafond par terminal ;
- plafond de volume journalier ;
- réserve ou hold au-delà d’un seuil de risque.

## 27. Limites Mobile Money

Chaque intégration Mobile Money doit respecter les limites du partenaire en plus des limites Mansa.

Le moteur doit distinguer :

```text
PARTNER_LIMIT
MANSA_LIMIT
REGULATORY_LIMIT
USER_LIMIT
``` 

La valeur réellement utilisable est la plus restrictive des limites applicables.

## 28. Limites transferts internationaux

Pour les transferts internationaux :

- limite par opération ;
- limite cumulée ;
- limite par corridor ;
- limite par devise ;
- limite par pays ;
- limite liée au niveau KYC ;
- contrôle sanctions/AML ;
- justification de source des fonds au-delà de seuils.

## 29. Limites FX

Le change doit pouvoir limiter :

- montant notionnel ;
- nombre d’opérations ;
- exposition devise ;
- variation de taux autorisée ;
- spread maximal configuré ;
- volume journalier client ;
- exposition globale plateforme.

## 30. Limites services État

Les paiements administratifs peuvent posséder des règles spécifiques.

Exemples :

- montant attendu exact ;
- interdiction de paiement partiel ;
- plafond par référence administrative ;
- nombre maximum de tentatives ;
- contrôle de doublon ;
- validité de la référence ;
- expiration.

Aucun agent ne doit pouvoir augmenter manuellement un montant administratif sans droit et audit.

## 31. Limites péages

Les règles péage doivent rester compatibles avec les architectures de référence Mansa :

- solution A : péage automatique classique avec barrière ;
- solution B : télépéage RFID UHF avec barrière ;
- évolution future optionnelle : free-flow sans barrière, sans remplacer les deux solutions initiales.

Le péage classique doit pouvoir accepter selon configuration :

- billets FCFA/XOF ;
- pièces FCFA/XOF ;
- carte bancaire EMV multi-réseaux selon l’acquéreur ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

Mobile Money doit rester activable ou désactivable par l’administration aux niveaux national, réseau, poste ou voie avec date d’effet et audit.

Le terminal carte ne doit jamais prétendre accepter toutes les cartes du monde : il accepte les réseaux effectivement activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles.

## 32. Contrôles de vélocité péage

Le système peut surveiller :

- passages répétés du même tag ;
- même plaque sur plusieurs tags ;
- même tag sur plusieurs plaques ;
- ouvertures manuelles fréquentes ;
- trop grand nombre de passages gratuits ;
- anomalies de classe véhicule ;
- répétition de refus suivie d’ouverture manuelle.

Le rapprochement anti-corruption doit relier :

```text
véhicule détecté
-> catégorie
-> tarif attendu
-> paiement
-> autorisation d’ouverture
-> ouverture réelle
-> passage physique
``` 

## 33. Télépéage et mode offline

Le télépéage initial utilise des tags UHF RFID passifs associés à un véhicule et à un compte, avec lecteur/antenne, contrôleur local, relais `OPEN`, barrière et capteurs de passage.

En mode offline, le contrôleur local doit disposer de limites de secours spécifiques.

Exemples :

- plafond de passages offline par tag ;
- plafond de montant offline cumulé ;
- expiration de la liste locale d’autorisation ;
- blocage local d’un tag à risque ;
- compteur local signé ou protégé contre altération.

Au retour du réseau :

- resynchronisation ;
- idempotence ;
- rapprochement ;
- absence de double débit ;
- consolidation des compteurs.

## 34. Multi-fournisseurs péage

Le matériel de péage reste multi-fournisseurs derrière des adaptateurs.

Les limites ne doivent pas dépendre d’une marque de borne, lecteur RFID, contrôleur, TPE, validateur de billets ou monnayeur.

Les équipements peuvent utiliser relais/contact sec ou interface industrielle documentée.

Les trois niveaux de déploiement doivent rester supportés :

```text
FULL_AUTOMATIC_LANE
SEMI_AUTOMATIC_LANE
LOW_COST_DIGITIZED_POST
``` 

L’État ou le concessionnaire peut acheter directement le matériel ou utiliser du matériel fourni, intégré ou revendu par Mansa.

## 35. Marque blanche péage

Les limites et messages de blocage doivent être compatibles avec la personnalisation État/concessionnaire :

- logo ;
- couleurs ;
- messages ;
- langues ;
- reçus ;
- écrans ;
- signalétique ;
- mention facultative `Propulsé par Mansa`.

La personnalisation visuelle ne doit jamais changer le résultat du moteur de limites.

## 36. Limites de solde

Le système doit pouvoir définir un solde maximal autorisé.

Avant crédit :

```text
projectedBalance = currentBalance + pendingCredits + requestedCredit
``` 

Si le solde projeté dépasse la limite :

- refuser ;
- plafonner uniquement si le produit l’autorise explicitement ;
- mettre en attente ;
- demander une action de conformité.

## 37. Limites de compte dormant

Un compte inactif pendant une période configurable peut être soumis à :

- limite réduite ;
- step-up obligatoire ;
- réauthentification forte ;
- revue si montant inhabituel.

## 38. Limites après changement sensible

Après :

- changement de téléphone ;
- changement de SIM ;
- changement d’appareil ;
- reset PIN ;
- récupération de compte ;
- changement email ;
- réinitialisation MFA ;

le système peut appliquer temporairement des limites réduites.

## 39. Limites basées sur le risque

Le risk engine peut recommander :

```text
NORMAL_LIMIT
REDUCED_LIMIT
TEMPORARY_LIMIT
BLOCK
STEP_UP_REQUIRED
MANUAL_REVIEW
``` 

Le moteur de risque ne doit pas augmenter un plafond réglementaire.

## 40. Signaux contextuels

Exemples de facteurs :

- appareil inconnu ;
- géolocalisation inhabituelle ;
- IP à risque ;
- proxy/TOR ;
- vitesse géographique impossible ;
- nouveau bénéficiaire ;
- nouveau commerçant ;
- montant inhabituel ;
- heure inhabituelle ;
- répétition rapide ;
- historique fraude.

## 41. Limites administratives

Les actions back-office sensibles doivent également avoir des contrôles :

- remboursements manuels ;
- ajustements de solde ;
- déblocages ;
- modifications de plafond ;
- suppression de restrictions ;
- création d’exemptions ;
- changements de commission ;
- ouverture manuelle de barrière dans le domaine péage.

## 42. Quorum et double validation

Au-dessus de certains seuils :

```text
REQUESTED
PENDING_APPROVAL
APPROVED
EXECUTED
REJECTED
EXPIRED
``` 

Une seule personne ne doit pas pouvoir demander, approuver et exécuter une opération critique lorsque la séparation des tâches est activée.

## 43. Overrides

Une dérogation doit préciser :

```text
reason
requestedBy
approvedBy
scope
oldLimit
newLimit
validFrom
validUntil
maxUses
incidentOrTicketReference
``` 

Une dérogation permanente doit être exceptionnelle.

## 44. Exemptions institutionnelles

Certaines entités publiques ou grandes entreprises peuvent avoir des profils adaptés.

Cela ne doit jamais contourner :

- obligations réglementaires ;
- sanctions ;
- contrôles AML/CFT obligatoires ;
- interdictions légales ;
- exigences de sécurité critiques.

## 45. Idempotence

L’évaluation de limite doit être compatible avec l’idempotence.

Une même requête rejouée avec la même clé d’idempotence ne doit pas consommer plusieurs fois la limite.

Le moteur doit distinguer :

```text
RESERVED
COMMITTED
RELEASED
EXPIRED
``` 

## 46. Concurrence

Les compteurs critiques doivent être atomiques.

Le système doit tester :

- deux transactions simultanées ;
- plusieurs appareils du même utilisateur ;
- plusieurs terminaux du même commerçant ;
- plusieurs agents sur la même caisse ;
- reprise après timeout ;
- replay webhook ;
- retry partenaire.

## 47. Données offline

Lorsqu’un canal fonctionne hors ligne :

- seules les limites explicitement autorisées offline sont disponibles ;
- les plafonds offline doivent être plus prudents si nécessaire ;
- les compteurs locaux doivent être protégés contre altération ;
- les événements doivent être ordonnés ;
- chaque opération doit avoir un identifiant unique ;
- la synchronisation doit consolider les compteurs sans double effet.

## 48. Décision de limite

Chaque décision doit produire une structure similaire à :

```json
{
  "decision": "ALLOW",
  "policyVersion": "...",
  "matchedRules": ["..."],
  "remainingAmount": 0,
  "remainingCount": 0,
  "resetAt": "...",
  "stepUpRequired": false
}
``` 

Aucun secret ni détail interne exploitable ne doit être exposé au client.

## 49. Messages utilisateurs

Le client doit recevoir un message compréhensible sans révéler les règles anti-fraude.

Exemples :

- « Plafond atteint pour aujourd’hui. »
- « Cette opération dépasse votre limite actuelle. »
- « Vérification supplémentaire requise. »
- « Réessayez plus tard ou contactez le support. »

Le détail exact du moteur reste côté serveur.

## 50. Notifications

Une notification peut être envoyée lors de :

- dépassement ;
- augmentation de limite ;
- réduction de limite ;
- blocage temporaire ;
- dérogation ;
- utilisation proche du plafond.

Les notifications doivent être configurables et localisées.

## 51. API

Endpoints possibles :

```text
GET /limits
GET /limits/remaining
POST /limits/evaluate
POST /limits/reservations
POST /limits/reservations/{id}/commit
POST /limits/reservations/{id}/release
POST /limits/change-requests
POST /limits/overrides
GET /admin/limit-policies
POST /admin/limit-policies
``` 

Les endpoints d’administration exigent RBAC strict et audit.

## 52. Permissions

Permissions recommandées :

```text
limits.read.self
limits.preference.update.self
limits.policy.read
limits.policy.create
limits.policy.update
limits.policy.approve
limits.override.request
limits.override.approve
limits.audit.read
``` 

## 53. Audit

Doivent être audités :

- création de politique ;
- activation ;
- modification ;
- désactivation ;
- override ;
- approbation ;
- dépassement critique ;
- changement réglementaire ;
- changement de scope ;
- changement de priorité.

L’audit doit conserver l’ancienne et la nouvelle valeur.

## 54. Observabilité

Métriques recommandées :

```text
limit_evaluations_total
limit_denials_total
limit_stepups_total
limit_overrides_total
limit_counter_conflicts_total
limit_reservation_expirations_total
limit_engine_latency_ms
limit_policy_errors_total
``` 

Les dashboards doivent permettre une vue par pays, produit, tenant et type de transaction sans exposer de données personnelles inutiles.

## 55. Alertes

Alertes possibles :

- hausse brutale des refus ;
- compteur incohérent ;
- politique absente ;
- moteur indisponible ;
- latence élevée ;
- override anormal ;
- changement massif de limites ;
- dépassements répétés par même acteur.

## 56. Disponibilité

Le moteur de limites est un composant critique.

Les opérations sensibles ne doivent pas automatiquement passer en mode permissif si le moteur devient indisponible.

Stratégies possibles :

```text
FAIL_CLOSED
FAIL_WITH_SAFE_OFFLINE_LIMIT
ALLOW_ONLY_LOW_RISK_OPERATIONS
MANUAL_FALLBACK
``` 

Le choix dépend du produit.

## 57. Cache des politiques

Les politiques peuvent être mises en cache pour disponibilité, mais :

- version obligatoire ;
- TTL ;
- invalidation ;
- signature ou intégrité lorsque nécessaire ;
- interdiction d’utiliser indéfiniment une politique expirée.

## 58. Versionnement

Chaque décision doit pouvoir être reliée à une version exacte de politique.

Une modification ne doit pas réécrire l’historique.

Le moteur doit conserver :

```text
policyId
policyVersion
effectiveFrom
effectiveUntil
changeReason
approvedBy
``` 

## 59. Simulation

Avant activation, un administrateur doit pouvoir simuler l’impact d’une politique sur des données historiques ou synthétiques.

Modes :

```text
DRY_RUN
SHADOW
ENFORCED
``` 

Le mode shadow journalise les décisions sans bloquer les transactions.

## 60. Déploiement progressif

Une nouvelle politique peut être activée :

- par pays ;
- par tenant ;
- par produit ;
- par segment ;
- par pourcentage ;
- par liste autorisée.

Le rollback doit être rapide et audité.

## 61. Tests unitaires

Les tests doivent couvrir :

- montant juste sous plafond ;
- montant égal au plafond ;
- montant supérieur ;
- compteur zéro ;
- compteur presque épuisé ;
- changement de fenêtre ;
- changement de devise ;
- priorité de règles ;
- override ;
- expiration de politique.

## 62. Tests de concurrence

Tester :

- 100 requêtes simultanées ;
- réservation concurrente ;
- timeout avant commit ;
- double commit ;
- retry ;
- expiration ;
- recovery après redémarrage.

Aucun scénario ne doit permettre de dépasser silencieusement un hard limit.

## 63. Tests de sécurité

Tester :

- modification non autorisée ;
- lecture cross-tenant ;
- falsification de scope ;
- downgrade de règle ;
- bypass via ancien endpoint ;
- replay ;
- modification directe côté client ;
- override sans approbation.

## 64. Tests multi-tenant

Une organisation ne doit jamais pouvoir :

- voir les politiques internes d’une autre organisation ;
- modifier ses plafonds ;
- lire ses compteurs ;
- créer une exemption pour elle.

Les politiques globales restent visibles uniquement selon les permissions prévues.

## 65. Tests offline

Pour agents, TPE, bornes et contrôleurs locaux :

- compteur local ;
- seuil offline ;
- redémarrage appareil ;
- horloge incorrecte ;
- réconciliation ;
- doublon ;
- perte de réseau prolongée ;
- retour réseau avec conflit.

## 66. Performance

L’évaluation doit être suffisamment rapide pour ne pas dégrader les paiements temps réel.

Objectifs indicatifs :

- décision locale/cache en quelques millisecondes ;
- décision distante dans le budget de latence du paiement ;
- compteurs atomiques optimisés ;
- aucune requête non bornée sur l’historique complet.

Les objectifs réels doivent être mesurés.

## 67. Rapprochement

Les compteurs peuvent être reconstruits depuis le ledger ou les événements sources lorsque nécessaire.

Un job de rapprochement doit détecter :

- compteur manquant ;
- compteur supérieur au réel ;
- compteur inférieur au réel ;
- réservation orpheline ;
- fenêtre mal clôturée.

Les corrections doivent être auditées.

## 68. Protection anti-contournement

Le système doit empêcher qu’un utilisateur contourne les limites en :

- changeant d’appareil ;
- changeant de canal ;
- alternant QR/carte/P2P ;
- fractionnant les montants ;
- utilisant plusieurs wallets liés ;
- utilisant plusieurs agents ;
- annulant puis répétant.

Le moteur doit pouvoir agréger plusieurs identités liées selon les règles de risque et de conformité.

## 69. Confidentialité

Les règles de limites peuvent utiliser des données sensibles uniquement si nécessaire.

Le système doit appliquer :

- minimisation ;
- contrôle d’accès ;
- rétention ;
- traçabilité ;
- séparation des données de risque.

## 70. Intégration conformité

Le moteur doit recevoir les profils issus de :

- KYC/KYB ;
- AML/CFT ;
- sanctions ;
- PPE ;
- risque fraude ;
- statut réglementaire.

Une règle de limite ne remplace pas une obligation de blocage conformité.

## 71. Intégration pricing

Le moteur de tarification peut utiliser le montant autorisé, mais ne doit pas modifier les limites.

Ordre recommandé :

```text
validate request
-> evaluate limits
-> evaluate risk/compliance
-> price operation
-> authorize
-> execute
``` 

Selon le type de frais, l’évaluation peut considérer montant principal + frais.

## 72. Intégration ledger

Les compteurs ne constituent pas la source comptable officielle.

Le ledger reste la source financière de référence.

Les compteurs sont des projections opérationnelles permettant des décisions rapides.

## 73. Intégration feature flags

Une règle de limite ne doit pas être remplacée par un simple feature flag.

Les feature flags peuvent contrôler un rollout, mais la règle doit rester versionnée et auditée dans le moteur de limites.

## 74. Gestion des changements réglementaires

Lorsqu’un plafond réglementaire change :

1. créer une nouvelle version ;
2. documenter la source et la date d’effet ;
3. faire valider ;
4. simuler ;
5. planifier l’activation ;
6. informer les produits concernés ;
7. auditer la prise d’effet.

Aucune valeur réglementaire ne doit être inventée ou supposée sans source validée.

## 75. Console administrateur

La console doit permettre :

- recherche de politiques ;
- filtres ;
- comparaison de versions ;
- visualisation des scopes ;
- simulation ;
- workflow d’approbation ;
- historique ;
- activation planifiée ;
- rollback.

Les changements critiques nécessitent des permissions renforcées.

## 76. Expérience utilisateur

L’utilisateur doit pouvoir voir, lorsque pertinent :

- limite totale ;
- montant utilisé ;
- montant restant ;
- date de remise à zéro ;
- cause générique d’un blocage ;
- possibilité de demander une augmentation si autorisée.

Les règles anti-fraude internes ne doivent pas être exposées.

## 77. Cas de blocage complet

Le système doit pouvoir imposer :

```text
ACCOUNT_FROZEN
OUTGOING_BLOCKED
INCOMING_BLOCKED
CASHOUT_BLOCKED
CARD_BLOCKED
INTERNATIONAL_BLOCKED
ADMIN_HOLD
``` 

Ces statuts sont distincts des limites quantitatives.

## 78. Migration

Lors de l’introduction du moteur :

1. inventorier les plafonds existants dans le code ;
2. identifier les valeurs en dur ;
3. créer les politiques équivalentes ;
4. activer shadow mode ;
5. comparer les décisions ;
6. corriger les divergences ;
7. activer progressivement ;
8. supprimer les anciens chemins uniquement après validation.

## 79. Critères d’acceptation

Le module est considéré prêt lorsque :

- les limites sont centralisées et versionnées ;
- les décisions sont atomiques ;
- les compteurs sont cohérents ;
- les retries sont idempotents ;
- les politiques multi-tenant sont isolées ;
- les overrides sont audités ;
- les modes offline sont bornés ;
- les règles péage respectent les architectures de référence ;
- les tests de concurrence et de sécurité passent ;
- les clients ne peuvent pas modifier localement les plafonds critiques.

## 80. Résultat attendu

Mansa doit disposer d’un moteur unique de limites capable de protéger les opérations financières et sensibles sur tous les canaux, tout en restant configurable selon pays, produit, niveau KYC, organisation, risque et réglementation.

La priorité est de garantir que les plafonds ne puissent pas être contournés par concurrence, changement de canal, retry, mode offline, multi-appareil ou intervention administrative non autorisée, tout en conservant une expérience claire pour les utilisateurs légitimes.
