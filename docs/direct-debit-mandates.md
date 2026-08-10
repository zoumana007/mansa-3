# Cahier des charges — Mandats de débit, prélèvements récurrents et autorisations de paiement

## 1. Objet

Ce document définit le domaine Mansa chargé des mandats de débit, autorisations de prélèvement, paiements récurrents initiés par un créancier et mécanismes d’autopay.

L’objectif est de permettre à un utilisateur, une entreprise ou une administration d’autoriser à l’avance certains débits dans un cadre explicite, traçable, révocable et contrôlé, sans confondre cette autorisation avec un abonnement commercial, une carte enregistrée ou un simple ordre de paiement ponctuel.

Le domaine complète les modules paiements, abonnements, factures, wallets, comptes, cartes, banque partenaire, Mobile Money, entreprises, secteur public, notifications, KYC/KYB, conformité, limites transactionnelles, fraude et reporting.

## 2. Principes directeurs

1. Aucun débit récurrent ne doit être possible sans base d’autorisation explicite et vérifiable.
2. Le mandat doit être distinct de l’opération financière qui l’utilise.
3. Un mandat doit pouvoir être activé, suspendu, révoqué, expiré et remplacé sans effacer l’historique.
4. Les limites du mandat ne doivent jamais permettre de dépasser les plafonds réglementaires, produit ou risque.
5. L’utilisateur doit pouvoir identifier clairement le créancier, le motif et la portée de son autorisation.
6. Un créancier ne doit pas pouvoir modifier unilatéralement les caractéristiques essentielles d’un mandat existant sans le mécanisme prévu par la politique applicable.
7. Chaque tentative de débit doit être rattachée au mandat utilisé.
8. Les retries doivent être idempotents et ne jamais produire de double débit.
9. Les dates, montants, notifications et délais doivent être configurables par pays, rail de paiement et partenaire.
10. Les mandats ne doivent jamais contenir de PIN, CVV, clé privée ou secret bancaire dans Git ou dans les logs.
11. La révocation d’un mandat doit empêcher toute nouvelle initiation, sauf traitement déjà irréversiblement engagé selon le rail concerné.
12. Les règles doivent supporter le multi-tenant, multi-pays, multi-devise et plusieurs rails de paiement.
13. Le système doit séparer consentement, exécution, règlement, remboursement et litige.
14. Le mode hors ligne ne doit jamais autoriser la création ou l’extension incontrôlée d’un mandat financier sensible.

## 3. Périmètre

Le domaine couvre notamment :

- autorisation de prélèvement ;
- mandat permanent ;
- mandat limité dans le temps ;
- mandat à montant fixe ;
- mandat à montant variable ;
- mandat à plafond maximum ;
- fréquence autorisée ;
- date de début ;
- date de fin ;
- créancier ;
- débiteur ;
- compte ou wallet source ;
- notification avant débit ;
- validation forte éventuelle ;
- débit automatique ;
- retry contrôlé ;
- suspension ;
- révocation ;
- renouvellement ;
- changement de compte source ;
- historique ;
- audit ;
- remboursement ;
- litige ;
- reporting ;
- API partenaires ;
- sandbox.

## 4. Non-objectifs

Ce domaine ne doit pas :

- remplacer le moteur d’abonnements ;
- remplacer le ledger ;
- remplacer le moteur de paiement ;
- remplacer le domaine facture ;
- inventer des règles réglementaires locales ;
- stocker des secrets de carte ;
- garantir qu’un rail bancaire externe accepte tous les types de mandats ;
- permettre à un créancier de contourner les limites ou la révocation.

## 5. Cas d’usage

Exemples :

- facture d’électricité ;
- eau ;
- internet ;
- téléphone ;
- assurance ;
- loyer ;
- abonnement SaaS ;
- mensualité de crédit lorsqu’autorisée ;
- cotisation ;
- frais scolaires ;
- service public ;
- recharge automatique ;
- paiement périodique entreprise-fournisseur ;
- collecte récurrente contractuelle.

## 6. Entités recommandées

```text
DebitMandate
DebitMandateVersion
MandateParty
MandateSourceAccount
MandateSchedule
MandateLimit
MandateConsent
MandateAuthentication
MandateNotificationPolicy
MandateExecution
MandateExecutionAttempt
MandateDebit
MandateRetryPolicy
MandateSuspension
MandateRevocation
MandateAmendment
MandateAuditLog
MandateDispute
MandateRefund
MandateProviderReference
MandateWebhookEvent
```

## 7. Débiteur

Le débiteur est la personne ou organisation dont le compte, wallet ou moyen autorisé peut être débité.

Champs recommandés :

```text
debtorType
debtorId
countryCode
kycOrKybLevel
status
```

Le débiteur doit être résolu depuis une identité Mansa ou une identité partenaire fiable.

## 8. Créancier

Le créancier est l’entité autorisée à demander l’exécution du mandat.

Types possibles :

```text
MERCHANT
ENTERPRISE
UTILITY
BANK
FINTECH
GOVERNMENT
PUBLIC_AGENCY
INSURER
EDUCATION_PROVIDER
TRANSPORT_OPERATOR
OTHER
```

Le créancier doit être identifié, vérifié et rattaché à un tenant ou partenaire autorisé.

## 9. Mandat

Un `DebitMandate` représente l’autorisation principale.

Champs minimaux :

```text
mandateId
debtorId
creditorId
sourceType
sourceId
mandateType
status
currency
validFrom
validUntil
createdAt
activatedAt
revokedAt
```

## 10. Types de mandat

```text
ONE_OFF_AUTHORIZATION
RECURRING_FIXED
RECURRING_VARIABLE
RECURRING_CAPPED
OPEN_ENDED_CAPPED
INSTALLMENT_PLAN
```

Un `ONE_OFF_AUTHORIZATION` peut être utilisé lorsque le rail impose une autorisation séparée avant exécution mais ne doit pas être réutilisable après consommation.

## 11. Statuts

```text
DRAFT
PENDING_CONSENT
PENDING_AUTHENTICATION
ACTIVE
SUSPENDED
REVOKED
EXPIRED
REPLACED
CANCELLED
```

## 12. Versionnement

Toute modification structurelle doit produire une version.

Exemples de modifications :

- plafond ;
- fréquence ;
- compte source ;
- date de fin ;
- créancier ;
- devise ;
- périmètre de service.

L’historique des versions doit rester lisible.

## 13. Consentement

Le consentement doit présenter au minimum :

- identité du créancier ;
- compte ou source à débiter ;
- fréquence ;
- montant fixe ou règle de montant ;
- plafond éventuel ;
- date de début ;
- date de fin si applicable ;
- méthode de révocation ;
- traitement des variations ;
- notifications prévues.

## 14. Preuve de consentement

Le système doit conserver une preuve minimale et auditée :

```text
consentId
mandateId
actorId
method
policyVersion
termsVersion
confirmedAt
channel
ipOrDeviceContextWhenPermitted
```

La preuve doit respecter la minimisation des données.

## 15. Authentification forte

Selon le niveau de risque ou le rail, l’activation peut exiger :

- PIN Mansa ;
- biométrie ;
- OTP ;
- validation sur appareil de confiance ;
- redirection bancaire ;
- signature électronique ;
- double validation entreprise.

Le résultat d’authentification doit être rattaché au mandat sans stocker les secrets d’authentification eux-mêmes.

## 16. Compte source

Un mandat peut être rattaché à :

```text
MANSA_WALLET
BANK_ACCOUNT
CARD_TOKEN
MOBILE_MONEY_ACCOUNT
PARTNER_ACCOUNT
OTHER_SUPPORTED_RAIL
```

La disponibilité réelle dépend des rails et partenaires activés.

## 17. Carte enregistrée

Une carte tokenisée utilisée pour des paiements récurrents ne doit jamais conduire Mansa à stocker le PAN complet ou le CVV.

Le mandat métier Mansa et le token de paiement restent deux objets distincts.

## 18. Wallet Mansa

Pour un wallet Mansa, le moteur doit vérifier avant chaque débit :

- statut du wallet ;
- solde disponible ;
- limites ;
- restrictions ;
- statut du mandat ;
- risque ;
- idempotence.

## 19. Compte bancaire

Lorsque le rail bancaire partenaire supporte des prélèvements ou mandats, Mansa doit conserver les références nécessaires derrière un adaptateur partenaire.

Mansa ne doit pas supposer qu’un mécanisme identique existe dans tous les pays ou toutes les banques.

## 20. Mobile Money

Une autorisation récurrente Mobile Money n’est disponible que si l’opérateur et le contrat l’autorisent.

Le domaine doit supporter plusieurs modèles :

```text
OPERATOR_MANDATE
TOKENIZED_AUTHORIZATION
USER_CONFIRM_EACH_DEBIT
PARTNER_RECURRING_API
```

Aucun modèle ne doit être simulé comme garanti s’il n’existe pas chez le fournisseur.

## 21. Montant fixe

Exemple :

```text
amount = 10000 XOF
frequency = MONTHLY
```

Chaque exécution doit être égale au montant autorisé, sauf modification formelle du mandat.

## 22. Montant variable

Un mandat variable doit contenir une règle explicite.

Exemple :

```text
maximumAmount = 50000 XOF
```

Le créancier peut initier un montant inférieur ou égal au plafond, sous réserve des autres règles.

## 23. Plafond par débit

Un mandat peut imposer :

```text
maxAmountPerDebit
```

Cette limite s’ajoute aux plafonds transactionnels Mansa.

## 24. Plafond par période

Exemples :

```text
maxAmountPerMonth
maxDebitCountPerMonth
```

Le moteur de limites central reste source des plafonds généraux ; le mandat ajoute ses propres contraintes.

## 25. Fréquence

Valeurs possibles :

```text
DAILY
WEEKLY
BIWEEKLY
MONTHLY
QUARTERLY
YEARLY
CUSTOM_INTERVAL
ON_INVOICE
ON_DEMAND_WITH_LIMITS
```

## 26. Calendrier

Un `MandateSchedule` peut contenir :

```text
frequency
interval
preferredDayOfMonth
preferredWeekday
timezone
nextEligibleAt
```

## 27. Jours impossibles

Si une date n’existe pas dans un mois, la politique doit préciser :

```text
MOVE_TO_LAST_DAY
MOVE_TO_NEXT_VALID_DAY
MOVE_TO_PREVIOUS_VALID_DAY
SKIP
```

Le comportement ne doit jamais être implicite.

## 28. Jours non ouvrés

Le traitement des jours non ouvrés dépend du rail.

Mansa doit permettre à l’adaptateur du rail de déterminer ou configurer le comportement sans coder une règle universelle erronée.

## 29. Fuseau horaire

Les dates d’éligibilité doivent être calculées avec un fuseau de référence explicite.

Le fuseau ne doit pas être déduit uniquement du téléphone de l’utilisateur.

## 30. Pré-notification

Une notification avant débit peut être requise par politique produit ou rail.

Elle peut indiquer :

- créancier ;
- montant ;
- date prévue ;
- référence ;
- méthode de contestation ou révocation.

Les délais sont configurables et ne doivent pas être inventés globalement.

## 31. Notification après débit

Après débit :

- succès ;
- échec ;
- montant ;
- créancier ;
- date ;
- solde si autorisé ;
- lien vers le détail.

## 32. Création

Workflow recommandé :

```text
CREATE_DRAFT
→ VALIDATE_PARTIES
→ VALIDATE_SOURCE
→ PRESENT_TERMS
→ COLLECT_CONSENT
→ STRONG_AUTH_IF_REQUIRED
→ ACTIVATE
```

## 33. Activation

L’activation doit vérifier :

- débiteur actif ;
- créancier actif ;
- source autorisée ;
- devise compatible ;
- limites cohérentes ;
- consentement valide ;
- authentification éventuelle ;
- conditions réglementaires ou contractuelles applicables.

## 34. Exécution

Chaque tentative doit créer une `MandateExecution` indépendante du mandat.

Champs recommandés :

```text
executionId
mandateId
scheduledFor
amount
currency
status
idempotencyKey
providerReference
createdAt
```

## 35. Statuts d’exécution

```text
SCHEDULED
ELIGIBLE
PROCESSING
AUTHORIZED
SETTLED
COMPLETED
FAILED
DECLINED
CANCELLED
REVERSED
REFUNDED
```

## 36. Évaluation avant débit

Avant chaque débit :

1. vérifier le mandat ;
2. vérifier la version active ;
3. vérifier la date ;
4. vérifier le montant ;
5. vérifier les limites du mandat ;
6. vérifier les limites Mansa ;
7. vérifier le statut du débiteur ;
8. vérifier la source ;
9. vérifier le créancier ;
10. exécuter les contrôles risque ;
11. réserver si nécessaire ;
12. initier le rail de paiement.

## 37. Idempotence

Une même exécution logique doit posséder une clé d’idempotence stable.

```text
mandateId + billingReference + dueDate
```

peut contribuer à la construction de la clé logique sans exposer de données sensibles.

## 38. Double débit

Le système doit empêcher :

- double scheduler ;
- retry après timeout ;
- webhook dupliqué ;
- relance manuelle ;
- exécution concurrente ;
- reprise après panne ;

de créer deux débits pour la même échéance logique.

## 39. Solde insuffisant

Une politique de retry peut s’appliquer.

Exemple :

```text
attempt 1 -> due date
attempt 2 -> configurable delay
attempt 3 -> configurable delay
then stop
```

Le nombre exact et les délais sont configurables par produit et rail.

## 40. Retry

Un retry doit utiliser la même exécution logique ou une relation explicite avec l’exécution d’origine.

Il ne doit pas contourner :

- plafonds ;
- révocation ;
- expiration ;
- suspension ;
- restrictions de risque.

## 41. Frais de retry

Aucun frais de retry ne doit être ajouté par défaut sans règle tarifaire explicite, contrat et information utilisateur appropriée.

## 42. Suspension par l’utilisateur

Selon produit, l’utilisateur peut suspendre temporairement un mandat.

Une suspension bloque les nouvelles exécutions éligibles.

## 43. Suspension système

Mansa peut suspendre pour :

- fraude ;
- compte restreint ;
- KYC requis ;
- créancier suspendu ;
- anomalie ;
- incident fournisseur ;
- litige ;
- risque élevé.

## 44. Révocation

Le débiteur doit pouvoir révoquer un mandat selon les règles du produit et du rail.

La révocation enregistre :

```text
revokedBy
revokedAt
reason
channel
```

## 45. Effet de la révocation

Après révocation :

- aucun nouveau débit ne peut être créé ;
- les futures échéances deviennent inéligibles ;
- le créancier est informé si prévu ;
- les opérations déjà irréversiblement engagées suivent leur cycle normal ;
- l’historique reste accessible.

## 46. Révocation par créancier

Un créancier peut renoncer au mandat.

Cela ne doit pas supprimer les traces historiques.

## 47. Expiration

Un mandat expire lorsque :

- `validUntil` est dépassé ;
- nombre maximal d’exécutions atteint ;
- rail externe indique expiration ;
- condition métier terminale atteinte.

## 48. Renouvellement

Un renouvellement doit produire une nouvelle preuve de consentement si les conditions essentielles changent ou si la politique l’exige.

## 49. Modification de montant

Pour un mandat fixe, modifier le montant doit créer une modification formelle.

Pour un mandat variable, une exécution reste autorisée uniquement dans la plage consentie.

## 50. Changement de créancier

Un changement d’identité juridique du créancier ne doit pas être traité comme une simple modification de libellé.

La politique doit déterminer s’il faut un nouveau mandat.

## 51. Changement de source

Changer le wallet, compte bancaire ou token source doit être authentifié et audité.

L’ancienne source ne doit plus être débitée après prise d’effet.

## 52. Créancier multi-service

Un mandat doit préciser son périmètre.

Exemple :

```text
UTILITY_ELECTRICITY
```

ne doit pas automatiquement autoriser d’autres services du même groupe si cela n’était pas consenti.

## 53. Référence facture

Une exécution peut être liée à une facture :

```text
invoiceId
invoiceReference
dueDate
```

Le mandat reste distinct de la facture.

## 54. Abonnements

Le module abonnements détermine le cycle commercial.

Le module mandats détermine si le créancier est autorisé à initier le débit.

Le moteur de paiement exécute le mouvement.

## 55. Paiement échoué d’un abonnement

Un abonnement ne doit pas créer plusieurs débits non idempotents lorsqu’une échéance est relancée.

La relation entre `subscriptionInvoice`, `MandateExecution` et `Payment` doit être unique et traçable.

## 56. Entreprises

Une entreprise peut exiger des approbations internes avant activation d’un mandat fournisseur.

Exemple :

```text
REQUESTER
→ FINANCE_APPROVER
→ TREASURY_APPROVER
→ ACTIVE
```

selon seuils.

## 57. Administration publique

Pour un service public, le mandat doit respecter les mêmes exigences de consentement, audit et révocation applicables au produit.

L’État ne doit pas bénéficier d’un mécanisme technique permettant de débiter arbitrairement un wallet sans base légale et produit clairement définie.

## 58. Péages

Le domaine péage conserve ses exigences de référence :

- péage automatique classique avec barrière ;
- télépéage RFID avec barrière ;
- évolution free-flow optionnelle ultérieure ;
- billets et pièces FCFA, carte EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money selon activation ;
- Mobile Money activable/désactivable par l’administration avec audit ;
- RFID UHF passif associé au véhicule et au compte ;
- fonctionnement local sécurisé ;
- matériel multi-fournisseurs ;
- trois niveaux d’équipement ;
- déploiement progressif ;
- marque blanche ;
- rapprochement anti-corruption.

Un abonnement télépéage peut utiliser une autorisation de débit pour recharger ou régler un compte, mais le tag RFID lui-même n’est pas le mandat financier.

## 59. Recharge automatique

Exemple :

```text
if walletBalance < 5000 XOF
then topUp 10000 XOF
```

Cette règle nécessite :

- mandat actif ;
- montant maximum ;
- fréquence maximale ;
- source autorisée ;
- prévention des boucles ;
- idempotence.

## 60. Prévention des boucles

Une recharge automatique ou un débit conditionnel ne doit pas se déclencher en boucle à cause d’un événement répété.

Des garde-fous doivent limiter :

```text
maxExecutionsPerHour
maxExecutionsPerDay
cooldown
```

## 61. Limites transactionnelles

Chaque exécution doit interroger le moteur central de limites.

Les limites du mandat sont additionnelles et ne remplacent pas :

- limite KYC ;
- limite wallet ;
- limite carte ;
- limite pays ;
- limite créancier ;
- limite de risque.

## 62. Risk engine

Le moteur de risque peut :

- bloquer une exécution ;
- demander une validation supplémentaire ;
- suspendre le mandat ;
- limiter les retries ;
- signaler un changement inhabituel.

## 63. Détection d’anomalies

Signaux possibles :

- hausse brutale du montant ;
- fréquence anormale ;
- nouveau créancier ;
- nouveau compte source ;
- nombreuses tentatives échouées ;
- débit après longue inactivité ;
- montant proche du plafond à répétition.

## 64. Notifications de modification

Toute modification sensible peut déclencher une notification :

- plafond ;
- source ;
- date ;
- créancier ;
- suspension ;
- réactivation ;
- révocation.

## 65. Audit

Événements minimaux :

```text
MANDATE_CREATED
CONSENT_GRANTED
AUTHENTICATION_COMPLETED
MANDATE_ACTIVATED
MANDATE_AMENDED
MANDATE_SUSPENDED
MANDATE_REACTIVATED
MANDATE_REVOKED
MANDATE_EXPIRED
EXECUTION_CREATED
EXECUTION_ATTEMPTED
EXECUTION_COMPLETED
EXECUTION_FAILED
REFUND_CREATED
DISPUTE_OPENED
```

## 66. Immutabilité de l’historique

Les événements passés ne doivent pas être édités.

Une correction doit créer un nouvel événement compensatoire ou une nouvelle version.

## 67. RBAC

Permissions recommandées :

```text
mandates:read
mandates:create
mandates:revoke
mandates:suspend
mandates:amend
mandates:execute
mandates:approve
mandates:audit:read
mandates:disputes:manage
```

## 68. Isolation multi-tenant

Un créancier ne doit accéder qu’aux mandats dans lesquels il est partie autorisée.

Une entreprise A ne doit jamais voir les mandats de l’entreprise B.

## 69. API partenaire

Endpoints conceptuels :

```text
POST /mandates
GET /mandates/{id}
POST /mandates/{id}/activate
POST /mandates/{id}/suspend
POST /mandates/{id}/revoke
POST /mandates/{id}/executions
GET /mandates/{id}/executions
```

Les noms exacts seront définis par la plateforme développeur.

## 70. Webhooks

Événements partenaires possibles :

```text
mandate.activated
mandate.suspended
mandate.revoked
mandate.expired
mandate.execution.succeeded
mandate.execution.failed
mandate.dispute.opened
```

Les webhooks suivent les règles de signature, retry et idempotence de la plateforme développeur.

## 71. Sandbox

La sandbox doit permettre :

- création de mandat fictif ;
- consentement simulé ;
- activation ;
- succès de débit ;
- solde insuffisant ;
- refus ;
- timeout ;
- retry ;
- révocation ;
- remboursement ;
- litige.

## 72. Erreurs

Codes possibles :

```text
MANDATE_NOT_FOUND
MANDATE_NOT_ACTIVE
MANDATE_EXPIRED
MANDATE_REVOKED
MANDATE_SUSPENDED
MANDATE_AMOUNT_EXCEEDED
MANDATE_FREQUENCY_EXCEEDED
MANDATE_SOURCE_UNAVAILABLE
MANDATE_CONSENT_REQUIRED
MANDATE_AUTHENTICATION_REQUIRED
MANDATE_EXECUTION_DUPLICATE
MANDATE_EXECUTION_TOO_EARLY
MANDATE_EXECUTION_LIMIT_EXCEEDED
```

## 73. Confidentialité

Les logs ne doivent pas contenir :

- PAN complet ;
- CVV ;
- PIN ;
- OTP ;
- mot de passe ;
- clé API ;
- secret webhook ;
- document d’identité complet sans nécessité.

## 74. Rétention

Les preuves de mandat, exécutions et audits doivent suivre une politique de conservation définie selon le pays, le rail et les obligations applicables.

La durée ne doit pas être codée en dur dans le produit mondial.

## 75. Portabilité

L’utilisateur doit pouvoir consulter et, lorsque prévu, exporter les informations utiles de ses mandats sans exposer de secrets du rail.

## 76. Suppression de compte

La clôture d’un compte doit traiter les mandats actifs avant suppression logique ou anonymisation.

Aucun mandat actif ne doit continuer silencieusement sur une source clôturée.

## 77. Décès ou succession

Le domaine comptes/succession peut suspendre les mandats selon la politique applicable.

Le moteur mandats doit accepter une restriction externe autorisée et la tracer.

## 78. Réconciliation

Chaque débit exécuté doit pouvoir être rapproché avec :

```text
mandateId
executionId
paymentId
ledgerEntryId
providerReference
settlementReference
```

selon les rails impliqués.

## 79. Règlement

Le mandat autorise l’initiation ; il ne garantit pas le règlement final.

Le statut de règlement appartient aux domaines paiement, acquiring, banque ou partenaire concernés.

## 80. Remboursement

Un remboursement doit référencer l’exécution et le paiement d’origine.

Il ne réactive pas automatiquement un mandat révoqué.

## 81. Litiges

Un utilisateur doit pouvoir identifier le mandat ayant généré un débit litigieux.

Le litige doit conserver :

- mandat ;
- exécution ;
- créancier ;
- preuve d’autorisation ;
- notifications ;
- paiements associés.

## 82. Chargebacks et rails externes

Les chargebacks éventuels restent gérés selon le rail carte ou partenaire.

Mansa doit relier leur référence au mandat lorsqu’un débit récurrent est concerné.

## 83. Observabilité

Métriques recommandées :

```text
mandates_active_total
mandates_created_total
mandates_revoked_total
mandate_executions_total
mandate_execution_success_total
mandate_execution_failed_total
mandate_retry_total
mandate_duplicate_prevented_total
mandate_disputes_total
```

## 84. Alertes internes

Alertes possibles :

- hausse des échecs ;
- timeout fournisseur ;
- taux de révocation anormal ;
- créancier avec hausse de litiges ;
- doublons détectés ;
- exécutions après suspension ;
- webhook partenaire en échec.

## 85. Performance

La validation d’une exécution doit être compatible avec le chemin critique du paiement.

Les règles de mandat doivent pouvoir être chargées efficacement sans relire tout l’historique à chaque tentative.

## 86. Haute disponibilité

Le scheduler et le moteur d’exécution doivent être conçus pour fonctionner avec plusieurs instances sans double traitement.

Un verrou logique, lease ou mécanisme transactionnel doit protéger l’appropriation d’une échéance.

## 87. Scheduler

Le scheduler détecte les exécutions éligibles mais ne doit pas directement déplacer de l’argent.

Il crée ou publie une commande idempotente traitée par le moteur d’exécution.

## 88. Reprise après panne

Après redémarrage :

- retrouver les échéances non traitées ;
- vérifier leur état ;
- éviter les doublons ;
- reprendre les exécutions sûres ;
- mettre en revue les cas ambigus.

## 89. Horloge serveur

Les décisions temporelles utilisent une horloge serveur fiable.

Le timestamp envoyé par le client ne doit pas permettre de rendre un mandat éligible plus tôt.

## 90. Concurrence

Tester :

- deux schedulers ;
- deux appels API simultanés ;
- retry webhook ;
- timeout fournisseur ;
- réponse tardive ;
- révocation pendant exécution ;
- modification pendant exécution.

## 91. Modification concurrente

Une exécution doit conserver la version du mandat évaluée au moment de son initiation.

Une modification ultérieure s’applique aux prochaines exécutions selon sa date d’effet.

## 92. Date d’effet d’une modification

Une modification peut être :

```text
IMMEDIATE
NEXT_EXECUTION
SCHEDULED_DATE
```

selon les règles autorisées.

## 93. Validation fournisseur

Avant activation en production d’un nouveau rail, les capacités réelles doivent être vérifiées :

- création de mandat ;
- révocation ;
- statut ;
- retry ;
- montant variable ;
- webhook ;
- remboursement ;
- sandbox ;
- contraintes contractuelles.

## 94. Adaptateurs

Interface conceptuelle :

```text
MandateProvider
createMandate()
activateMandate()
revokeMandate()
getMandateStatus()
executeDebit()
getExecutionStatus()
refundDebit()
```

Tous les fournisseurs n’implémentent pas forcément toutes les méthodes ; les capacités doivent être déclarées.

## 95. Capability matrix

Chaque adaptateur doit annoncer :

```text
supportsMandates
supportsVariableAmount
supportsProviderRevocation
supportsInstantRevocation
supportsRecurringDebit
supportsRefund
supportsWebhook
supportsStatusQuery
supportsSandbox
```

## 96. Fallback

Si un fournisseur ne supporte pas les mandats récurrents, Mansa ne doit pas simuler une autorisation permanente non sécurisée.

Alternatives possibles :

- demande de confirmation à chaque paiement ;
- autre rail ;
- carte tokenisée si contractuellement et techniquement autorisée ;
- désactivation de la fonctionnalité.

## 97. UX client

L’utilisateur doit disposer d’une page « Paiements automatiques » ou équivalent présentant :

- créancier ;
- statut ;
- source ;
- prochain débit ;
- dernier débit ;
- montant/plafond ;
- fréquence ;
- bouton suspendre si autorisé ;
- bouton révoquer ;
- historique.

## 98. UX créancier

Le portail créancier peut afficher :

- mandats actifs ;
- en attente ;
- suspendus ;
- révoqués ;
- taux de succès ;
- exécutions ;
- échecs ;
- retries ;
- litiges.

Les données restent limitées au tenant concerné.

## 99. Accessibilité

Les informations essentielles ne doivent pas dépendre uniquement de la couleur.

Les écrans de consentement doivent être lisibles, localisables et adaptés aux technologies d’assistance.

## 100. Langues

Les textes visibles doivent être localisables.

Pour les produits Mali, le français et le bamanankan peuvent être supportés selon l’interface, avec l’anglais et d’autres langues selon configuration produit.

Les textes contractuels doivent utiliser la version juridiquement validée pour le contexte concerné.

## 101. Tests unitaires

Couvrir :

- création ;
- consentement ;
- activation ;
- montant fixe ;
- variable ;
- plafond ;
- fréquence ;
- expiration ;
- suspension ;
- révocation ;
- retry ;
- idempotence ;
- modification ;
- fuseau ;
- calendrier.

## 102. Tests d’intégration

Tester :

```text
Mandate -> Payment -> Ledger
Mandate -> Provider -> Webhook
Mandate -> Invoice -> Execution
Mandate -> Refund
Mandate -> Dispute
Mandate -> Risk
Mandate -> Limits
```

## 103. Tests de sécurité

Tester :

- accès horizontal à un mandat ;
- exécution par mauvais créancier ;
- modification de montant ;
- modification de source ;
- replay ;
- exécution après révocation ;
- injection ;
- escalation RBAC ;
- falsification d’heure ;
- double débit concurrent.

## 104. Tests de résilience

Scénarios :

- fournisseur indisponible ;
- timeout ;
- réponse inconnue ;
- webhook perdu ;
- webhook dupliqué ;
- reprise scheduler ;
- base temporairement indisponible ;
- événement traité deux fois.

## 105. Critères d’acceptation MVP

Le MVP est acceptable lorsque :

1. un mandat peut être créé ;
2. le consentement est traçable ;
3. un mandat peut être activé et révoqué ;
4. un montant fixe ou plafonné peut être défini ;
5. une exécution est rattachée au mandat ;
6. les retries sont idempotents ;
7. aucun double débit n’est possible sur une même échéance logique ;
8. les limites centralisées sont vérifiées ;
9. les permissions multi-tenant sont appliquées ;
10. les événements d’audit sont conservés ;
11. les notifications principales existent ;
12. les capacités fournisseur sont déclarées et non supposées.

## 106. Phase 2

Ajouter progressivement :

- montants variables avancés ;
- multi-source ;
- règles de retry par créancier ;
- portail créancier ;
- pré-notification avancée ;
- approbations entreprise ;
- analytics ;
- renouvellement guidé ;
- plusieurs rails nationaux.

## 107. Phase 3

Prévoir ensuite :

- orchestration multi-pays ;
- migration de mandats entre fournisseurs lorsque juridiquement et techniquement possible ;
- optimisation de paiement par rail ;
- recommandations de prévention d’échec ;
- automatisation de rapprochement avancée ;
- outils de conformité et audit institutionnels.

## 108. Résultat attendu

Mansa dispose d’un domaine unique pour représenter les autorisations de débit récurrent, indépendamment du rail de paiement.

L’utilisateur conserve une vision claire de ce qu’il a autorisé, le créancier ne peut débiter que dans le périmètre consenti, et chaque exécution reste traçable, idempotente, contrôlée par les limites, le risque et les règles du fournisseur.

Cette architecture permet d’ajouter progressivement banques, Mobile Money, cartes tokenisées, wallets Mansa, entreprises et services publics sans mélanger consentement, abonnement commercial et exécution financière.