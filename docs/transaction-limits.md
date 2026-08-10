# Cahier des charges — Plafonds transactionnels, limites et règles de vélocité

## 1. Objet

Ce document définit le moteur central de plafonds, limites transactionnelles et règles de vélocité de Mansa.

Il s’applique aux opérations financières et sensibles réalisées par les particuliers, commerçants, agents, entreprises, administrations, partenaires, cartes, wallets, API, TPE, distributeurs, Mobile Money, virements, paiements, retraits, dépôts, remboursements, payouts, services publics, transport et péages.

Le moteur doit permettre de décider, avant une opération, si celle-ci est autorisée au regard des plafonds applicables, des règles réglementaires, contractuelles, commerciales, opérationnelles et de risque, sans dupliquer la logique dans chaque produit.

Il complète les domaines paiements, wallets, ledger, cartes, agents, KYC/KYB, fraude et risque, pricing, cash-in, cash-out, ATM, payouts, API partenaires, secteur public et gestion des équipements. Il ne remplace pas leurs règles métier.

## 2. Principes directeurs

1. Une limite doit être définie comme une politique explicite, versionnée et auditable.
2. Les limites doivent être évaluées côté serveur, jamais uniquement dans l’application cliente.
3. Les plafonds peuvent dépendre du pays, de la devise, du produit, du profil KYC/KYB, du canal, du rôle, du risque, du contrat, du partenaire ou du type d’opération.
4. Une limite ne doit jamais être contournée par le fractionnement artificiel d’une opération lorsque des règles de vélocité existent.
5. Les compteurs doivent être résistants aux retries, à l’idempotence, aux doublons et aux pannes réseau.
6. Les opérations refusées ne doivent pas consommer un plafond sauf politique explicitement définie.
7. Les opérations annulées, reversées ou remboursées doivent appliquer une règle de restitution du plafond explicite selon leur nature.
8. Toute modification administrative d’une limite doit être historisée avec auteur, date d’effet et motif.
9. Les limites réglementaires ont priorité sur les limites commerciales plus permissives.
10. Un administrateur ne doit pas pouvoir accorder une dérogation au-delà d’un plafond réglementaire non dérogeable.
11. Les valeurs affichées au client doivent être cohérentes avec les règles réellement exécutées côté serveur.
12. Le moteur doit fonctionner en multi-pays et multi-devise sans valeurs codées en dur.
13. Les décisions doivent être explicables par un code stable et une trace d’audit.
14. Les règles doivent pouvoir être évaluées en temps réel avec une latence compatible avec le paiement.
15. Les règles critiques hors ligne doivent utiliser des plafonds locaux bornés et synchronisables sans créer de double dépense.

## 3. Périmètre

Le moteur couvre notamment :

- montant minimum par opération ;
- montant maximum par opération ;
- cumul journalier ;
- cumul glissant sur 24 heures ;
- cumul hebdomadaire ;
- cumul mensuel ;
- cumul annuel ;
- nombre maximal d’opérations ;
- fréquence minimale entre opérations ;
- limites par bénéficiaire ;
- limites par émetteur ;
- limites par compte ;
- limites par wallet ;
- limites par carte ;
- limites par appareil ;
- limites par terminal ;
- limites par agent ;
- limites par commerçant ;
- limites par entreprise ;
- limites par administration ;
- limites par partenaire API ;
- limites par pays ;
- limites par zone géographique ;
- limites par devise ;
- limites par canal ;
- limites par type d’opération ;
- limites selon niveau KYC/KYB ;
- limites selon niveau de risque ;
- dérogations temporaires ;
- plafonds réglementaires ;
- plafonds contractuels ;
- plafonds commerciaux ;
- réservations de capacité ;
- restitution de capacité ;
- limites hors ligne ;
- simulation et prévisualisation ;
- alertes de seuil ;
- journal d’audit ;
- reporting des dépassements et tentatives.

## 4. Terminologie

### 4.1 Limite

Une `LimitPolicy` exprime une contrainte mesurable applicable à un contexte donné.

### 4.2 Plafond

Un plafond est une limite supérieure qui ne doit pas être dépassée.

### 4.3 Plancher

Un plancher est une valeur minimale exigée pour qu’une opération soit admise.

### 4.4 Vélocité

Une règle de vélocité mesure la fréquence ou le cumul d’opérations sur une fenêtre temporelle.

### 4.5 Fenêtre fixe

Exemple : du début à la fin de la journée locale.

### 4.6 Fenêtre glissante

Exemple : les dernières 24 heures à partir de l’instant de l’opération.

### 4.7 Compteur

Un compteur représente la consommation courante d’une politique.

### 4.8 Réservation

Une réservation immobilise temporairement une partie de la capacité disponible avant finalisation de l’opération.

## 5. Entités recommandées

```text
LimitPolicy
LimitPolicyVersion
LimitScope
LimitCondition
LimitThreshold
LimitCounter
LimitCounterBucket
LimitReservation
LimitConsumption
LimitRelease
LimitOverride
LimitException
LimitEvaluation
LimitDecision
LimitAlert
LimitAuditLog
LimitSimulation
LimitRegulatorySource
LimitProductBinding
LimitKycTierBinding
LimitRiskTierBinding
OfflineLimitProfile
```

## 6. Types de limites

Valeurs recommandées :

```text
MIN_AMOUNT
MAX_AMOUNT_PER_TRANSACTION
MAX_AMOUNT_PER_PERIOD
MAX_COUNT_PER_PERIOD
MAX_AMOUNT_PER_BENEFICIARY
MAX_COUNT_PER_BENEFICIARY
MAX_AMOUNT_PER_DEVICE
MAX_COUNT_PER_DEVICE
MAX_AMOUNT_PER_CHANNEL
MAX_COUNT_PER_CHANNEL
MIN_INTERVAL
MAX_OUTSTANDING_AMOUNT
MAX_OFFLINE_AMOUNT
MAX_OFFLINE_COUNT
```

Le moteur doit rester extensible.

## 7. Portées d’application

Une politique peut s’appliquer à un ou plusieurs niveaux :

```text
GLOBAL
COUNTRY
LEGAL_ENTITY
ORGANIZATION
PRODUCT
OPERATION_TYPE
CUSTOMER_SEGMENT
KYC_TIER
KYB_TIER
RISK_TIER
USER
ACCOUNT
WALLET
CARD
MERCHANT
AGENT
DEVICE
TERMINAL
API_APPLICATION
BENEFICIARY
CHANNEL
CURRENCY
```

## 8. Priorité des politiques

Lorsque plusieurs politiques s’appliquent, Mansa doit appliquer la contrainte effective la plus restrictive, sauf règle de composition explicitement documentée.

Ordre de gouvernance recommandé :

```text
REGULATORY
→ LEGAL_ENTITY
→ RISK
→ CONTRACTUAL
→ PRODUCT
→ COMMERCIAL
→ USER_OVERRIDE
```

Une politique de rang inférieur ne peut pas rendre l’ensemble plus permissif qu’une politique supérieure non dérogeable.

## 9. Sources des limites

Une politique doit indiquer sa source :

```text
REGULATION
CENTRAL_BANK
INTERNAL_RISK
CONTRACT
PRODUCT_POLICY
PARTNER_POLICY
CAMPAIGN
MANUAL_OVERRIDE
MIGRATION
OTHER
```

Pour les limites réglementaires, une référence documentaire ou réglementaire peut être enregistrée sans stocker de contenu confidentiel.

## 10. Versionnement

Toute modification d’une politique crée une version.

Champs recommandés :

```text
policyId
version
status
validFrom
validUntil
createdBy
approvedBy
reason
createdAt
```

Les anciennes décisions doivent rester interprétables avec la version qui était active au moment de l’évaluation.

## 11. Statuts d’une politique

```text
DRAFT
PENDING_APPROVAL
ACTIVE
SUSPENDED
EXPIRED
RETIRED
```

Une politique `DRAFT` ne doit jamais influencer les transactions réelles.

## 12. Date d’effet

Une politique peut être préparée à l’avance et devenir active à une date donnée.

La date d’effet doit utiliser une horloge serveur fiable.

Pour les règles dépendantes d’une journée locale, le fuseau horaire de référence doit être explicite par pays ou produit.

## 13. Types de fenêtres temporelles

Le moteur doit supporter au minimum :

```text
CALENDAR_DAY
ROLLING_24_HOURS
CALENDAR_WEEK
ROLLING_7_DAYS
CALENDAR_MONTH
ROLLING_30_DAYS
CALENDAR_YEAR
ROLLING_DURATION
LIFETIME
```

## 14. Journée locale

Une limite journalière doit préciser son fuseau horaire.

Exemple :

```text
Africa/Bamako
Europe/Paris
```

Le changement de fuseau ne doit pas permettre de réinitialiser artificiellement un plafond.

## 15. Montants et devises

Les montants doivent être représentés dans un format monétaire sûr et cohérent avec le ledger Mansa.

Une politique doit contenir :

```text
amount
currency
```

Les comparaisons multi-devises doivent utiliser une règle explicite. Une limite en XOF ne doit pas être convertie silencieusement avec un taux non traçable.

## 16. Limite par opération

Exemple :

```text
MAX_AMOUNT_PER_TRANSACTION = 500000 XOF
```

Une transaction de `500001 XOF` doit être refusée avant tout mouvement irréversible.

## 17. Limite cumulée

Exemple :

```text
MAX_AMOUNT_PER_PERIOD
window = CALENDAR_DAY
threshold = 2000000 XOF
```

Le moteur calcule :

```text
consommé + réservé + opération demandée
```

et compare le résultat au plafond.

## 18. Limite en nombre d’opérations

Exemple :

```text
MAX_COUNT_PER_PERIOD
window = ROLLING_24_HOURS
threshold = 20
```

Les opérations comptabilisées doivent être définies par statut.

## 19. Intervalle minimal

Une règle peut imposer :

```text
MIN_INTERVAL = 30 seconds
```

entre deux opérations comparables.

Cette règle peut servir à réduire le spam, les doubles clics, certains scénarios de fraude ou la surcharge d’un canal.

## 20. Limites par bénéficiaire

Mansa doit pouvoir limiter les envois vers un même bénéficiaire.

Clés possibles :

```text
beneficiaryUserId
beneficiaryAccountId
beneficiaryWalletId
beneficiaryPhoneHash
beneficiaryBankAccountFingerprint
beneficiaryExternalId
```

Les identifiants sensibles doivent être minimisés ou pseudonymisés dans les compteurs lorsque possible.

## 21. Limites par appareil

Une politique peut protéger contre l’usage massif d’un même appareil sur plusieurs comptes.

Le moteur peut utiliser un identifiant d’appareil de confiance, sans utiliser un fingerprint invasif non justifié.

## 22. Limites par terminal

Applicable aux TPE, caisses, bornes, tablettes État, terminaux d’agents et automates.

Exemples :

- nombre maximal de transactions hors ligne ;
- montant cumulé hors ligne ;
- nombre de remboursements ;
- volume d’annulations ;
- volume de paiements manuels.

## 23. Limites par agent

Un agent peut avoir :

- plafond de dépôt ;
- plafond de retrait ;
- plafond de cash-in ;
- plafond de cash-out ;
- plafond de caisse ;
- nombre maximal d’opérations ;
- limites selon niveau de certification ;
- limites temporaires selon liquidité disponible.

Les limites agent complètent, sans remplacer, la gestion de liquidité et de risque.

## 24. Limites commerçant

Un commerçant peut avoir des limites selon :

- volume d’encaissement ;
- remboursement ;
- paiement manuel ;
- paiement à distance ;
- nombre de transactions ;
- montant par ticket ;
- exposition au règlement différé.

## 25. Limites entreprise

Pour les entreprises :

- montant par paiement ;
- montant de masse ;
- nombre de bénéficiaires ;
- masse salariale ;
- payouts journaliers ;
- limites par rôle d’approbateur ;
- limites par centre de coût.

## 26. Limites secteur public

Les administrations peuvent définir des règles supplémentaires par service :

```text
TAX
FINE
TUITION
SCHOLARSHIP
LICENSE
TOLL
TRANSPORT
OTHER
```

Un plafond administratif ne doit jamais affaiblir une contrainte financière ou réglementaire obligatoire.

## 27. Péages

Pour le domaine péage, le moteur de limites doit respecter les exigences de référence suivantes :

- coexistence du péage automatique classique avec barrière et du télépéage RFID avec barrière ;
- évolution future optionnelle vers du free-flow sans remplacer les deux solutions initiales ;
- péage classique compatible, selon activation, avec billets et pièces FCFA, carte bancaire EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money ;
- Mobile Money activable ou désactivable au niveau national, réseau, poste ou voie, avec date d’effet et audit ;
- télépéage initial basé sur tags UHF RFID passifs, véhicule, compte, lecteur/antenne, contrôleur local, relais `OPEN`, barrière et capteurs ;
- fonctionnement local/hors ligne sécurisé avec absence de double débit et resynchronisation ;
- terminal carte limité aux réseaux activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles ;
- matériel multi-fournisseurs derrière des adaptateurs ;
- trois niveaux d’équipement : voie automatique complète, voie semi-automatique, poste numérisé à faible coût ;
- déploiement progressif ;
- matériel acheté par l’État/concessionnaire ou fourni/intégré/revendu par Mansa ;
- marque blanche État/concessionnaire et mention facultative `Propulsé par Mansa` ;
- rapprochement anti-corruption entre véhicule, catégorie, tarif, paiement, ouverture et passage physique.

Les limites péage peuvent par exemple borner :

- nombre de passages hors ligne par tag ;
- montant cumulé hors ligne ;
- nombre d’ouvertures manuelles par agent ;
- nombre d’exceptions tarifaires ;
- volume de remboursements ;
- fréquence de modification de catégorie véhicule.

## 28. Limites carte

Le moteur doit pouvoir évaluer :

- achat par opération ;
- achat journalier ;
- retrait ATM ;
- paiement sans contact ;
- paiement e-commerce ;
- paiement international ;
- paiement hors ligne ;
- nombre de transactions ;
- plafond configurable par le client dans la limite des plafonds supérieurs.

## 29. Limite utilisateur personnalisée

Un utilisateur peut réduire volontairement certaines limites.

Exemple :

```text
systemMax = 500000 XOF
userMax = 100000 XOF
effectiveMax = 100000 XOF
```

L’utilisateur ne peut jamais augmenter au-delà de la borne autorisée par les politiques supérieures.

## 30. Profils KYC/KYB

Les niveaux KYC/KYB peuvent déterminer les limites disponibles.

Exemple conceptuel :

```text
KYC_TIER_0 → faible plafond
KYC_TIER_1 → plafond intermédiaire
KYC_TIER_2 → plafond supérieur
```

Les valeurs ne doivent pas être codées en dur dans ce document et doivent être configurées selon pays, réglementation et politique Mansa.

## 31. Changement de niveau KYC

Lorsqu’un utilisateur passe à un niveau supérieur, les nouvelles limites prennent effet selon politique.

Une baisse de niveau ou restriction peut réduire immédiatement les limites lorsque le risque l’exige.

## 32. Niveau de risque

Le risk engine peut appliquer une politique plus restrictive :

```text
NORMAL
ELEVATED
HIGH
RESTRICTED
```

Une décision de risque ne doit pas augmenter un plafond réglementaire.

## 33. Limites dynamiques

Certaines limites peuvent être calculées dynamiquement selon :

- ancienneté ;
- historique ;
- risque ;
- liquidité ;
- contrat ;
- comportement ;
- contexte ;
- capacité d’un canal.

Toute formule dynamique doit être versionnée et explicable.

## 34. Dérogations

Une `LimitOverride` permet une exception contrôlée.

Champs minimaux :

```text
overrideId
subjectType
subjectId
policyId
newThreshold
validFrom
validUntil
reason
requestedBy
approvedBy
status
```

## 35. Double validation

Les dérogations sensibles peuvent exiger une séparation des tâches :

```text
REQUESTER != APPROVER
```

Le même administrateur ne doit pas être en mesure de créer et approuver seul une dérogation lorsque la politique l’interdit.

## 36. Dérogation temporaire

Toute dérogation doit avoir une durée limitée lorsqu’elle est exceptionnelle.

À expiration, le système revient automatiquement à la politique normale.

## 37. Réservations de plafond

Pour les opérations asynchrones, Mansa peut réserver de la capacité.

Exemple :

```text
AVAILABLE
→ RESERVED
→ CONSUMED
```

ou :

```text
AVAILABLE
→ RESERVED
→ RELEASED
```

## 38. Idempotence des réservations

Une même opération idempotente ne doit pas réserver deux fois la même capacité.

La réservation doit être liée à l’identifiant logique de l’opération et à la clé d’idempotence lorsqu’elle existe.

## 39. Expiration des réservations

Une réservation doit avoir une date d’expiration.

Si l’opération ne se finalise pas, la capacité est libérée selon une procédure sûre et auditée.

## 40. Consommation du plafond

La consommation peut intervenir à différents moments selon produit :

```text
AUTHORIZED
CAPTURED
SETTLED
COMPLETED
```

Le moment exact doit être défini par type d’opération.

## 41. Restitution après annulation

Une annulation avant finalisation peut libérer la capacité réservée.

Une annulation après finalisation suit les règles de reversal ou remboursement applicables.

## 42. Remboursements

Un remboursement ne doit pas automatiquement réaugmenter tous les plafonds.

La restitution dépend de :

- nature du plafond ;
- type d’opération ;
- délai ;
- risque de contournement ;
- réglementation.

Exemple : un plafond de dépense peut être restitué alors qu’un compteur anti-fraude de nombre d’opérations reste consommé.

## 43. Reversals techniques

Un reversal purement technique d’une transaction qui n’a jamais été effectivement finalisée doit pouvoir restaurer la capacité initiale.

La relation entre transaction d’origine et reversal doit être explicite.

## 44. Échecs

Les opérations `DECLINED`, `FAILED` ou `CANCELLED` ne consomment pas un plafond financier par défaut.

Elles peuvent toutefois alimenter des compteurs de sécurité séparés.

## 45. Compteurs de tentatives

Exemples :

```text
failedPinAttempts
failedPaymentAttempts
failedOtpAttempts
refundAttempts
manualOverrideAttempts
```

Ces compteurs ne doivent pas être confondus avec les plafonds financiers.

## 46. Atomicité

L’évaluation et la réservation d’un plafond critique doivent être atomiques.

Deux requêtes concurrentes ne doivent pas toutes deux voir la même capacité comme disponible puis dépasser le plafond.

## 47. Concurrence

Le moteur doit être testé contre :

- doubles clics ;
- retries réseau ;
- requêtes parallèles ;
- paiements simultanés ;
- multi-appareils ;
- multi-canaux ;
- reprise après panne.

## 48. Stockage des compteurs

Le stockage peut utiliser une combinaison de :

- base transactionnelle ;
- compteurs atomiques ;
- cache distribué ;
- agrégats temporels.

La source de vérité et la stratégie de reconstruction doivent être documentées.

## 49. Reconstruction

Les compteurs critiques doivent pouvoir être reconstruits à partir des événements ou transactions de référence en cas de corruption ou migration.

Le système ne doit pas dépendre uniquement d’un compteur impossible à auditer.

## 50. Exactitude

Pour les flux financiers sensibles, une approximation de compteur ne doit pas permettre de dépasser un plafond obligatoire.

Les structures probabilistes peuvent être utilisées pour des pré-alertes non bloquantes mais pas comme source unique d’un plafond réglementaire.

## 51. Évaluation

Entrée conceptuelle :

```json
{
  "subject": { "type": "USER", "id": "usr_..." },
  "operationType": "TRANSFER",
  "amount": 100000,
  "currency": "XOF",
  "channel": "MOBILE_APP",
  "country": "ML",
  "beneficiaryId": "usr_...",
  "idempotencyKey": "..."
}
```

## 52. Résultat d’évaluation

Exemple :

```json
{
  "decision": "ALLOW",
  "evaluationId": "lev_...",
  "remaining": {
    "dailyAmount": 400000,
    "dailyCount": 4
  }
}
```

## 53. Décisions possibles

```text
ALLOW
ALLOW_WITH_RESERVATION
REQUIRE_STEP_UP
REQUIRE_APPROVAL
DENY
```

## 54. Refus

Un refus doit fournir un code stable.

Exemples :

```text
BELOW_MINIMUM_AMOUNT
PER_TRANSACTION_LIMIT_EXCEEDED
DAILY_AMOUNT_LIMIT_EXCEEDED
DAILY_COUNT_LIMIT_EXCEEDED
ROLLING_LIMIT_EXCEEDED
BENEFICIARY_LIMIT_EXCEEDED
DEVICE_LIMIT_EXCEEDED
OFFLINE_LIMIT_EXCEEDED
REGULATORY_LIMIT_EXCEEDED
TEMPORARY_OVERRIDE_EXPIRED
```

## 55. Message utilisateur

Le client reçoit un message utile sans exposer la logique anti-fraude sensible.

Exemple :

> Cette opération dépasse votre plafond actuel.

Le détail complet reste réservé aux journaux autorisés.

## 56. Step-up authentication

Une opération proche ou au-dessus d’un seuil intermédiaire peut demander une authentification renforcée au lieu d’être immédiatement refusée.

Exemples :

- biométrie ;
- PIN ;
- OTP ;
- validation sur appareil de confiance ;
- validation par approbateur entreprise.

## 57. Approbation entreprise

Une règle peut demander une approbation lorsque :

```text
amount > approverThreshold
```

La validation d’un approbateur ne doit pas contourner un plafond supérieur non dérogeable.

## 58. Limites API partenaires

Les partenaires API peuvent avoir :

- limite financière ;
- nombre d’opérations ;
- limite par bénéficiaire ;
- quota commercial ;
- rate limiting technique.

Le rate limiting HTTP et les plafonds financiers sont deux mécanismes distincts.

## 59. Rate limiting technique

Le rate limiting protège la plateforme contre la surcharge et les abus techniques.

Exemples :

```text
requestsPerSecond
requestsPerMinute
burstCapacity
```

Une requête techniquement rate-limitée ne doit pas créer de réservation financière fantôme.

## 60. Mobile Money

Les limites Mobile Money doivent être configurables selon l’opérateur, le pays, le canal, le type d’opération et les exigences contractuelles ou réglementaires.

Dans les péages, l’administration conserve la capacité d’activer ou désactiver Mobile Money au niveau national, réseau, poste ou voie avec audit ; cette activation n’annule pas les plafonds financiers applicables.

## 61. Cash-in

Limites possibles :

- montant par dépôt ;
- cumul journalier ;
- nombre de dépôts ;
- dépôt par agent ;
- dépôt par automate ;
- dépôt par compte ;
- dépôt espèces hors ligne.

## 62. Cash-out

Limites possibles :

- montant par retrait ;
- cumul journalier ;
- nombre de retraits ;
- plafond agent ;
- plafond ATM ;
- plafond par appareil ;
- délai entre retraits.

## 63. ATM

Le distributeur doit combiner :

- capacité physique de billets ;
- plafond carte ;
- plafond compte ;
- plafond réseau ;
- plafond transactionnel ;
- limites de risque.

La valeur effective est la plus restrictive des contraintes applicables.

## 64. Mode hors ligne

Les opérations hors ligne exigent un profil spécifique et borné.

Un `OfflineLimitProfile` peut contenir :

```text
maxOfflineAmount
maxOfflineCount
maxSingleOfflineAmount
validUntil
lastSyncAt
```

## 65. Principe hors ligne

Le hors ligne ne doit jamais répliquer sans contrôle les limites complètes disponibles en ligne.

La capacité hors ligne doit être plus restrictive et compatible avec le risque de double dépense.

## 66. Synchronisation après hors ligne

Au retour du réseau :

1. transmettre les opérations locales ;
2. dédupliquer ;
3. appliquer l’idempotence ;
4. rapprocher les réservations ;
5. recalculer les compteurs ;
6. détecter les dépassements ;
7. ouvrir un incident si nécessaire.

## 67. Dépassement découvert après synchronisation

Un dépassement postérieur ne doit pas être effacé.

Le système doit :

- conserver les opérations ;
- signaler la divergence ;
- appliquer la politique de risque ;
- éventuellement suspendre le mode hors ligne ;
- déclencher une revue.

## 68. Alertes de seuil

Le moteur peut générer des alertes à :

```text
50%
75%
90%
100%
```

ou selon seuils configurables.

## 69. Notification utilisateur

L’utilisateur peut être informé qu’il approche de son plafond lorsque cela apporte de la valeur.

Les notifications ne doivent pas divulguer des règles anti-fraude cachées.

## 70. Prévisualisation

Les interfaces peuvent demander :

```text
remainingLimit
nextResetAt
```

pour afficher un plafond restant.

La valeur doit être calculée à partir du même moteur que l’autorisation réelle.

## 71. Simulation administrateur

Un administrateur autorisé doit pouvoir simuler une opération sans la comptabiliser.

La simulation retourne :

- politiques applicables ;
- valeur effective ;
- compteurs ;
- décision ;
- raison ;
- version des règles.

## 72. Mode test

Les environnements sandbox peuvent avoir des limites fictives indépendantes de la production.

Aucune donnée de compteur production ne doit être utilisée en sandbox.

## 73. Audit

Chaque décision bloquante ou dérogation sensible doit laisser une trace.

Champs recommandés :

```text
evaluationId
subjectId
operationId
policyIds
policyVersions
counterSnapshot
decision
reasonCode
createdAt
```

## 74. Audit administratif

Toute modification de configuration enregistre :

```text
oldValue
newValue
author
approver
reason
effectiveAt
createdAt
```

## 75. Immutabilité

Les journaux d’audit ne doivent pas être modifiables par les rôles opérationnels ordinaires.

Les corrections doivent créer de nouveaux événements.

## 76. Confidentialité

Les journaux de limites ne doivent pas contenir de secrets, PIN, CVV, données carte complètes ou informations personnelles non nécessaires.

## 77. RBAC

Permissions recommandées :

```text
limits:read
limits:simulate
limits:create
limits:update
limits:approve
limits:override
limits:audit:read
limits:regulatory:manage
```

## 78. Séparation des tâches

Les politiques réglementaires et dérogations à forte sensibilité peuvent imposer :

- créateur ;
- validateur ;
- auditeur ;

comme personnes distinctes.

## 79. Multi-tenant

Une organisation ne doit jamais pouvoir consulter ou modifier les politiques d’une autre organisation sans autorisation explicite.

Les politiques globales Mansa restent dans un périmètre privilégié.

## 80. Multi-pays

Chaque pays peut avoir :

- règles réglementaires ;
- devise ;
- fuseau ;
- niveaux KYC ;
- canaux ;
- partenaires ;
- seuils différents.

Le moteur doit conserver un modèle commun sans fusionner les contraintes nationales.

## 81. Changements réglementaires

Une nouvelle limite peut être préparée avec :

```text
validFrom = future date
```

et activée automatiquement à l’heure prévue.

L’ancienne version reste historisée.

## 82. Rollback

Un rollback administratif ne doit pas effacer l’historique.

Il crée une nouvelle version reprenant une configuration antérieure.

## 83. Cache

Les politiques peuvent être mises en cache pour la performance.

Le cache doit :

- respecter la version ;
- expirer ;
- être invalidé après publication ;
- ne pas permettre l’usage prolongé d’une règle révoquée critique.

## 84. Haute disponibilité

Le moteur de limites fait partie du chemin critique de nombreuses transactions.

Il doit prévoir :

- redondance ;
- timeouts ;
- observabilité ;
- stratégie de dégradation ;
- reprise après incident.

## 85. Fail closed / fail open

Chaque produit doit définir le comportement si le moteur est indisponible.

Pour une opération financière sensible, le comportement par défaut doit être conservateur.

Un `fail open` éventuel doit être explicitement borné, autorisé et audité.

## 86. Performance

L’évaluation doit viser une latence faible et stable.

Les accès à plusieurs compteurs ne doivent pas provoquer une explosion du nombre de requêtes internes.

## 87. Observabilité

Métriques recommandées :

```text
limit_evaluations_total
limit_denials_total
limit_reservations_total
limit_releases_total
limit_evaluation_latency
limit_counter_conflicts_total
limit_override_total
limit_sync_divergence_total
```

## 88. Tableaux de bord

Le portail administrateur peut afficher :

- taux de refus par limite ;
- plafonds les plus atteints ;
- utilisateurs proches des seuils ;
- dérogations actives ;
- divergences hors ligne ;
- tendances par produit et pays.

Les tableaux doivent respecter les permissions et la minimisation des données.

## 89. Détection d’abus

Un volume élevé de tentatives juste sous un plafond peut alimenter le risk engine.

Le moteur de limites fournit des signaux mais ne remplace pas la détection de fraude.

## 90. Anti-fractionnement

Le système doit permettre des règles détectant plusieurs petites opérations qui contournent un plafond par opération.

Exemple :

```text
10 transactions de 99 000 XOF
```

peuvent être soumises à un plafond cumulé ou une règle de vélocité.

## 91. Anti-contournement multi-canal

Les compteurs peuvent agréger plusieurs canaux.

Exemple :

```text
APP + USSD + AGENT + API
```

pour éviter de multiplier artificiellement le plafond en changeant de canal.

## 92. Anti-contournement multi-carte

Si une limite est au niveau utilisateur ou compte, plusieurs cartes liées ne doivent pas chacune obtenir automatiquement le plafond complet.

Le périmètre du compteur doit être explicite.

## 93. Gestion des comptes liés

Les politiques peuvent s’appliquer à :

```text
individualAccount
household
businessGroup
legalEntity
```

uniquement lorsque le cadre juridique et produit l’autorise.

## 94. Bénéficiaires nouveaux

Une politique peut être plus restrictive pour un nouveau bénéficiaire pendant une période donnée.

Cela doit rester configurable et compatible avec la politique de risque.

## 95. Nouvel appareil

Une opération sensible depuis un nouvel appareil peut avoir une limite temporaire inférieure ou nécessiter un step-up.

## 96. Nouvel utilisateur

Une limite de démarrage peut être utilisée pour un compte récent.

Elle doit expirer automatiquement selon la politique.

## 97. Cartes virtuelles temporaires

Les cartes virtuelles jetables ou temporaires peuvent avoir des plafonds dédiés :

- montant unique ;
- nombre d’usages ;
- durée ;
- commerçant ;
- catégorie marchande.

## 98. Budget utilisateur

Les budgets personnels ne doivent pas être confondus avec les plafonds de sécurité.

Un budget peut générer une alerte sans bloquer ; un plafond peut bloquer.

L’interface doit distinguer les deux notions.

## 99. Limite de crédit

Une limite de crédit ou d’exposition est un domaine financier distinct mais peut être interrogée par le moteur.

Le moteur de limites ne calcule pas à lui seul le risque de crédit.

## 100. Escrow

Les paiements séquestres peuvent réserver des capacités spécifiques pendant la période de séquestre.

Les montants immobilisés doivent être distingués des montants consommés.

## 101. Abonnements

Les prélèvements récurrents peuvent avoir :

- plafond par abonnement ;
- plafond mensuel ;
- nombre maximal de débits ;
- limite de variation du montant.

## 102. Paiements de factures

Les factures peuvent avoir des limites par fournisseur ou catégorie sans affaiblir les limites utilisateur globales.

## 103. Transferts internationaux

Les transferts internationaux peuvent combiner :

- plafond local ;
- plafond de change ;
- plafond bénéficiaire ;
- plafond pays ;
- plafond corridor ;
- exigences de conformité.

## 104. Devise de référence

Lorsqu’un plafond agrège plusieurs devises, la méthode de conversion doit être documentée :

- source du taux ;
- timestamp ;
- marge éventuelle ;
- règle d’arrondi ;
- comportement si le taux est indisponible.

## 105. Administration

Le portail doit permettre aux rôles autorisés de :

- rechercher une politique ;
- créer un brouillon ;
- comparer les versions ;
- simuler ;
- soumettre pour approbation ;
- publier ;
- suspendre ;
- planifier une date d’effet ;
- consulter les compteurs ;
- accorder une dérogation ;
- exporter l’audit.

## 106. Recherche

Filtres possibles :

```text
country
product
operationType
scopeType
status
source
validAt
currency
```

## 107. Interface utilisateur final

Le client peut voir lorsque pertinent :

- plafond par opération ;
- plafond restant ;
- date de réinitialisation ;
- possibilité de réduire son propre plafond ;
- raison générale d’un blocage.

Les règles internes sensibles ne sont pas exposées.

## 108. Accessibilité

Les messages de plafond doivent être compréhensibles, localisables et compatibles avec les langues du produit.

Le refus ne doit pas être communiqué uniquement par couleur.

## 109. Localisation

Les unités, devises et dates doivent être affichées selon le contexte local sans modifier les valeurs financières sous-jacentes.

## 110. API interne

Interface conceptuelle :

```text
POST /internal/limits/evaluate
POST /internal/limits/reservations
POST /internal/limits/reservations/{id}/consume
POST /internal/limits/reservations/{id}/release
GET  /internal/limits/subjects/{id}/remaining
```

Ces routes sont indicatives et ne constituent pas un contrat public définitif.

## 111. Événements

Événements recommandés :

```text
limit.policy.created
limit.policy.activated
limit.policy.suspended
limit.evaluation.allowed
limit.evaluation.denied
limit.reservation.created
limit.reservation.consumed
limit.reservation.released
limit.override.created
limit.override.expired
limit.threshold.near
limit.offline.divergence_detected
```

## 112. Intégration ledger

Le ledger reste source de vérité des mouvements financiers.

Le moteur de limites ne doit pas modifier directement les soldes.

Il autorise, réserve et comptabilise la consommation de politiques en coordination avec le workflow transactionnel.

## 113. Intégration risk engine

Le risk engine peut :

- proposer une limite plus restrictive ;
- demander un step-up ;
- bloquer temporairement ;
- signaler un comportement anormal.

Le moteur de limites applique les politiques résultantes dans le cadre de ses règles de priorité.

## 114. Intégration KYC/KYB

Le moteur reçoit un niveau de vérification fiable depuis le domaine identité/conformité.

Il ne déduit pas lui-même le statut KYC depuis des champs utilisateur non fiables.

## 115. Intégration cartes

Le domaine carte doit demander l’autorisation des limites applicables avant une décision définitive lorsque Mansa maîtrise ce contrôle.

Les limites réseau ou acquéreur externes restent distinctes et peuvent produire un refus supplémentaire.

## 116. Intégration agents

Le moteur doit pouvoir vérifier simultanément :

```text
limite client
+ limite agent
+ liquidité agent
+ limite produit
+ limite réglementaire
```

sans fusionner ces notions.

## 117. Intégration appareils

Le service de gestion des appareils fournit les identités de terminal fiables, leur statut et leurs capacités.

Un terminal compromis ou révoqué ne doit pas bénéficier de sa capacité de plafond restante.

## 118. Tests unitaires

Couvrir au minimum :

- seuil exact ;
- seuil dépassé de 1 unité ;
- minimum ;
- fenêtre fixe ;
- fenêtre glissante ;
- plusieurs politiques ;
- priorité ;
- dérogation ;
- expiration ;
- multi-devise ;
- fuseau horaire ;
- réservation ;
- libération ;
- reversal ;
- remboursement.

## 119. Tests de concurrence

Tester plusieurs opérations simultanées qui tentent de consommer la dernière capacité disponible.

Une seule combinaison valide doit pouvoir être confirmée sans dépassement.

## 120. Tests d’idempotence

Tester :

```text
même clé + même payload
même clé + payload différent
retry après timeout
retry après réponse perdue
```

Aucune double réservation ni double consommation ne doit apparaître.

## 121. Tests temporels

Tester :

- changement de jour ;
- changement de mois ;
- fuseaux ;
- années ;
- fenêtre glissante ;
- date d’effet future ;
- expiration de dérogation.

## 122. Tests hors ligne

Tester :

- plafond local ;
- plusieurs appareils ;
- reconnexion ;
- doublons ;
- opérations en conflit ;
- resynchronisation partielle ;
- dépassement découvert après synchronisation.

## 123. Tests de permissions

Vérifier qu’un administrateur non autorisé ne peut pas :

- modifier un plafond réglementaire ;
- approuver sa propre dérogation ;
- consulter les politiques d’un autre tenant ;
- antidater une règle sans droit ;
- effacer l’audit.

## 124. Tests de sécurité

Inclure :

- validation stricte des entrées ;
- injection ;
- accès horizontal ;
- escalade de privilèges ;
- race conditions ;
- compteur falsifié côté client ;
- replay ;
- changement de devise ;
- manipulation du timestamp client.

## 125. Données de test

Les tests doivent utiliser des identités, comptes et montants fictifs.

Aucun secret ou donnée réelle ne doit être stocké dans le dépôt.

## 126. Critères d’acceptation MVP

Le MVP est acceptable lorsque :

1. une politique peut être créée et versionnée ;
2. les limites par opération et par période fonctionnent ;
3. les compteurs sont atomiques ;
4. les retries sont idempotents ;
5. plusieurs politiques sont combinées correctement ;
6. les limites par KYC et pays sont supportées ;
7. les refus retournent un code stable ;
8. les réservations sont libérables ;
9. l’audit est disponible ;
10. les permissions administratives sont appliquées ;
11. les tests de concurrence passent ;
12. aucune valeur réglementaire n’est codée en dur dans le moteur.

## 127. Phase 2

Ajouter progressivement :

- fenêtres glissantes avancées ;
- limites dynamiques de risque ;
- agrégation multi-canal ;
- dérogations à double validation ;
- dashboard ;
- alertes de seuil ;
- limites par bénéficiaire ;
- profils hors ligne ;
- simulations administratives.

## 128. Phase 3

Prévoir ensuite :

- politiques multi-entités avancées ;
- orchestration de limites par corridor international ;
- modèles prédictifs de risque sous gouvernance ;
- optimisation de compteurs à très grande échelle ;
- outils de simulation réglementaire ;
- analyse d’impact avant publication d’une nouvelle politique.

## 129. Non-objectifs

Ce module ne doit pas :

- remplacer le ledger ;
- remplacer le moteur de fraude ;
- remplacer KYC/KYB ;
- décider seul de la conformité réglementaire ;
- stocker les secrets des partenaires ;
- inventer les plafonds réglementaires ;
- permettre à un client de choisir un plafond supérieur à son maximum autorisé.

## 130. Résultat attendu

Mansa dispose d’un moteur unique et cohérent pour appliquer les plafonds transactionnels à l’ensemble de l’écosystème.

Les produits peuvent évoluer indépendamment tout en partageant les mêmes mécanismes de compteur, priorité, idempotence, réservation, dérogation, audit, multi-pays, multi-devise et fonctionnement hors ligne.

Cette centralisation réduit les divergences entre canaux, limite les contournements par fractionnement ou multi-appareil, et permet à Mansa d’adapter ses plafonds aux exigences réglementaires, contractuelles et de risque sans réécrire chaque application.