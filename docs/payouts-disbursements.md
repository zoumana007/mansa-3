# Cahier des charges — Payouts, décaissements et versements sortants

## 1. Objet

Ce document définit le domaine Mansa de payouts, décaissements, versements sortants, paiements de masse et règlements vers des bénéficiaires externes ou internes.

Il complète les domaines déjà documentés de wallets, ledger, transferts, paiements, acquisition, commerce, agents, trésorerie, rapprochement, règlement, paie, secteur public, remboursements, tarification, fraude, conformité et notifications. Il ne remplace aucun de ces domaines.

L’objectif est de fournir un moteur central permettant à Mansa, aux commerçants, entreprises, administrations, collectivités, marketplaces et partenaires autorisés d’envoyer des fonds de manière traçable, contrôlée, idempotente et auditable vers un ou plusieurs bénéficiaires.

## 2. Cas d’usage couverts

Le domaine couvre notamment :

- versement commerçant après encaissement ;
- règlement d’un vendeur marketplace ;
- paiement fournisseur ;
- remboursement manuel autorisé ;
- paiement de salaire ou d’indemnité ;
- paiement de bourse, aide ou prestation publique ;
- paiement de commission agent ;
- paiement de commission partenaire ;
- reversement concessionnaire ;
- redistribution d’une collecte ;
- remboursement de dépôt de garantie ;
- paiement de frais ou honoraires ;
- paiement en masse depuis un fichier ou une API ;
- paiement récurrent planifié ;
- payout instantané lorsque le rail le permet ;
- payout différé ou par lot ;
- payout vers wallet Mansa ;
- payout vers compte bancaire ;
- payout vers Mobile Money ;
- payout vers carte ou autre rail uniquement si le partenaire contractuel le permet.

## 3. Principes directeurs

1. tout payout doit être initié côté serveur et persisté avant toute tentative externe ;
2. aucune application cliente ne doit être source de vérité du statut financier ;
3. tout payout doit avoir une clé d’idempotence ;
4. le montant principal, les frais, les taxes et les commissions doivent être séparés ;
5. le bénéficiaire doit être identifié selon le niveau de risque et la réglementation applicable ;
6. aucun payout ne doit contourner les contrôles KYC/KYB, sanctions, fraude, limites ou disponibilité de fonds ;
7. le ledger doit enregistrer la réservation, le débit, le règlement, l’échec et la correction ;
8. le statut externe d’un provider ne doit jamais écraser l’historique interne ;
9. les webhooks et retours provider doivent être authentifiés et idempotents ;
10. un timeout réseau ne signifie jamais automatiquement échec financier ;
11. tout payout doit être réconciliable avec la banque, l’opérateur ou le provider ;
12. les opérations sensibles doivent pouvoir exiger une double validation ;
13. les paiements de masse doivent supporter validation, simulation et reprise partielle ;
14. aucune donnée bancaire ou secret provider ne doit être stocké en clair dans les journaux ;
15. les changements manuels de statut financier sont interdits hors workflow de correction audité.

## 4. Modèle fonctionnel

Entités recommandées :

```text
Payout
PayoutBatch
PayoutBatchItem
PayoutBeneficiary
PayoutDestination
PayoutInstruction
PayoutAttempt
PayoutRoute
PayoutProvider
PayoutQuote
PayoutFee
PayoutApproval
PayoutHold
PayoutSchedule
PayoutReconciliation
PayoutException
PayoutReturn
PayoutCancellation
PayoutAuditEvent
```

Chaque entité doit porter les identifiants de pays, devise, organisation, tenant, environnement et acteur lorsque pertinents.

## 5. Types de destinations

Le moteur doit supporter au minimum :

```text
MANSA_WALLET
BANK_ACCOUNT
MOBILE_MONEY
MERCHANT_BALANCE
AGENT_BALANCE
INTERNAL_LEDGER_ACCOUNT
CARD_RAIL_IF_SUPPORTED
OTHER_PROVIDER_IF_SUPPORTED
```

Les rails réellement disponibles dépendent du pays, du contrat, de la banque partenaire, de l’acquéreur, de l’opérateur et du provider.

Mansa ne doit jamais promettre qu’un payout peut être envoyé vers n’importe quel compte ou carte du monde.

## 6. Bénéficiaire

Un bénéficiaire peut être :

- particulier ;
- commerçant ;
- entreprise ;
- agent ;
- fournisseur ;
- salarié ;
- administration ;
- collectivité ;
- établissement public ;
- concessionnaire ;
- partenaire ;
- organisation interne.

Champs recommandés :

```text
beneficiaryId
legalName
displayName
type
countryCode
kycStatus
riskLevel
sanctionsStatus
organizationId
externalReference
status
```

Les informations de destination doivent être stockées séparément du profil métier.

## 7. Destination bancaire

Une destination bancaire peut contenir :

```text
accountHolderName
bankCountry
bankCode
branchCode
accountNumberMasked
ibanMasked
bic
currency
providerBeneficiaryId
verificationStatus
```

Les données sensibles doivent être chiffrées au repos et masquées dans les interfaces.

L’IBAN ne doit être exigé que dans les zones où il est applicable.

## 8. Destination Mobile Money

Une destination Mobile Money peut contenir :

```text
countryCode
operator
msisdnMasked
currency
providerBeneficiaryId
verificationStatus
```

Le moteur doit gérer les différences d’opérateurs, de formats de numéro, de limites et de statuts.

## 9. Destination wallet Mansa

Un payout interne vers wallet Mansa doit être traité comme une écriture ledger interne avec la même discipline d’idempotence et d’audit.

Il ne doit pas créer de dépendance externe lorsque les deux comptes sont internes.

## 10. Création d’un payout

Exemple d’intention :

```text
organizationId
sourceAccountId
beneficiaryId
destinationId
amount
currency
purpose
externalReference
idempotencyKey
requestedExecutionDate
```

Le serveur valide les données, calcule les frais, applique les politiques et crée l’instruction.

## 11. États du payout

États recommandés :

```text
DRAFT
PENDING_VALIDATION
PENDING_APPROVAL
SCHEDULED
QUEUED
FUNDS_RESERVED
SUBMITTED
PROCESSING
SUCCEEDED
FAILED
CANCELLED
RETURNED
REVERSED
ON_HOLD
MANUAL_REVIEW
RECONCILIATION_PENDING
```

Les transitions doivent être définies dans une machine d’état explicite.

## 12. Idempotence

Une même `idempotencyKey` dans le même scope ne doit jamais créer deux payouts financiers.

Le scope recommandé inclut :

```text
organizationId
operationType
idempotencyKey
```

Une répétition avec les mêmes paramètres retourne le même objet.

Une répétition avec des paramètres différents doit être rejetée.

## 13. Réservation des fonds

Avant soumission externe, le moteur peut réserver les fonds.

Exemple ledger :

```text
AVAILABLE_BALANCE -100000
PAYOUT_RESERVED +100000
```

Après succès :

```text
PAYOUT_RESERVED -100000
PAYOUT_SETTLED +100000
```

Après échec définitif avant règlement :

```text
PAYOUT_RESERVED -100000
AVAILABLE_BALANCE +100000
```

Aucune correction ne doit être réalisée par simple modification d’un solde.

## 14. Disponibilité des fonds

Le moteur doit vérifier :

- solde disponible ;
- fonds réservés ;
- limites ;
- éventuel minimum de trésorerie ;
- contraintes contractuelles ;
- éventuels holds ;
- statut du compte source.

Un solde comptable positif ne signifie pas nécessairement que la totalité est disponible au payout.

## 15. Payout immédiat

Un payout immédiat peut être exécuté dès validation lorsque :

- les contrôles sont satisfaits ;
- les fonds sont disponibles ;
- le rail est disponible ;
- aucune approbation supplémentaire n’est requise.

Le terme « instantané » ne doit être affiché que si le rail et le contrat permettent raisonnablement cette promesse.

## 16. Payout planifié

Un payout peut être planifié à une date future.

Le système doit distinguer :

- date demandée ;
- date d’éligibilité ;
- date de soumission réelle ;
- date de règlement provider ;
- date de disponibilité bénéficiaire lorsqu’elle est connue.

## 17. Payouts de masse

Un batch peut contenir de quelques bénéficiaires à un volume important.

Workflow recommandé :

```text
UPLOAD_OR_API
-> PARSE
-> VALIDATE
-> PRICE
-> RISK_CHECK
-> PREVIEW
-> APPROVE
-> RESERVE_FUNDS
-> EXECUTE
-> RECONCILE
-> REPORT
```

Chaque ligne possède son propre statut.

L’échec d’une ligne ne doit pas nécessairement annuler tout le batch.

## 18. Import de fichier

Formats possibles :

- CSV ;
- XLSX via conversion contrôlée ;
- format partenaire documenté.

Le fichier doit être analysé avant création financière.

Le moteur doit détecter :

- doublons ;
- colonnes manquantes ;
- montants invalides ;
- devise invalide ;
- bénéficiaire inconnu ;
- destination invalide ;
- lignes dupliquées ;
- total incohérent.

## 19. Prévisualisation d’un batch

Avant validation finale, afficher au minimum :

```text
nombre de lignes
nombre valide
nombre invalide
montant principal total
frais totaux
taxes totales
montant total débité
devise
rails utilisés
alertes
```

Une prévisualisation n’engage aucun mouvement financier.

## 20. Approbations

Les politiques doivent supporter :

```text
NO_APPROVAL
SINGLE_APPROVAL
DUAL_APPROVAL
THRESHOLD_BASED
ROLE_BASED
MULTI_LEVEL
```

Exemple : un opérateur prépare le batch, un responsable financier approuve.

La personne qui crée une instruction sensible ne doit pas nécessairement pouvoir l’approuver seule.

## 21. Séparation des tâches

Pour les entreprises et administrations, Mansa doit pouvoir appliquer :

- préparateur ;
- valideur ;
- approbateur ;
- trésorier ;
- auditeur.

Les rôles doivent être configurables par organisation.

## 22. Contrôles conformité

Avant payout, vérifier selon contexte :

- statut KYC/KYB ;
- sanctions ;
- listes internes ;
- pays ou zone interdite ;
- motif de paiement ;
- bénéficiaire ;
- seuils réglementaires ;
- provenance des fonds ;
- règles AML ;
- statut fiscal si pertinent.

Un blocage conformité doit être explicite et audité.

## 23. Contrôles fraude

Signaux possibles :

- nouveau bénéficiaire + montant élevé ;
- changement récent de compte bancaire ;
- grand nombre de bénéficiaires nouveaux ;
- payout inhabituel ;
- vitesse anormale ;
- device ou session à risque ;
- destination déjà liée à fraude ;
- fractionnement de montants ;
- tentatives répétées après échec ;
- horaire inhabituel ;
- payout vers compte contrôlé par le créateur.

Le moteur de risque peut autoriser, bloquer, retarder ou envoyer en revue.

## 24. Confirmation de bénéficiaire

Pour les destinations sensibles, une confirmation peut être exigée lors de l’ajout ou de la modification.

Exemples :

- OTP ;
- validation par administrateur ;
- micro-vérification si le rail le permet ;
- vérification nom-compte si disponible ;
- délai de sécurité après changement de destination.

La fonctionnalité dépend des capacités du pays et du provider.

## 25. Changement de coordonnées bancaires

Un changement sensible doit générer :

- audit ;
- notification ;
- éventuel délai de refroidissement ;
- nouvelle vérification ;
- éventuellement nouvelle approbation.

Les anciennes coordonnées ne doivent pas être écrasées sans historique.

## 26. Routage provider

Le moteur doit isoler les providers derrière des adaptateurs.

Exemple :

```text
PayoutProviderAdapter
- createBeneficiary()
- submitPayout()
- getPayoutStatus()
- cancelPayout()
- parseWebhook()
- downloadReconciliation()
```

Le domaine métier ne doit pas dépendre directement d’un fournisseur unique.

## 27. Sélection du rail

La route peut dépendre de :

```text
country
currency
destinationType
amount
providerAvailability
cost
speed
contract
risk
cutoff
beneficiaryBank
operator
```

Le moteur doit conserver la route choisie et la justification technique/commerciale pertinente.

## 28. Multi-provider

Plusieurs providers peuvent être disponibles pour un même rail.

Le fallback automatique n’est autorisé que si le système peut prouver qu’une première tentative n’a pas créé de mouvement financier.

En cas d’incertitude, le payout passe en `MANUAL_REVIEW` ou `RECONCILIATION_PENDING` plutôt que d’être renvoyé aveuglément.

## 29. Timeout provider

Un timeout signifie :

```text
UNKNOWN_EXTERNAL_STATE
```

et non :

```text
FAILED
```

Le moteur doit interroger le provider, attendre un webhook, utiliser une référence idempotente externe et réconcilier avant toute nouvelle tentative.

## 30. Références externes

Chaque tentative conserve :

```text
providerId
providerRequestId
providerPayoutId
providerStatus
submittedAt
lastCheckedAt
```

Les références doivent permettre un rapprochement complet.

## 31. Webhooks

Les webhooks provider doivent :

- être authentifiés ;
- supporter replay protection ;
- être idempotents ;
- conserver l’événement brut de manière sécurisée lorsque nécessaire ;
- enregistrer la date de réception ;
- être reliés à la tentative concernée ;
- ne jamais permettre une transition interdite.

## 32. Retry

Les retries doivent être classés :

```text
SAFE_RETRY
STATUS_CHECK_ONLY
MANUAL_REVIEW
NO_RETRY
```

Un retry financier n’est jamais déclenché uniquement parce qu’une requête HTTP a échoué.

## 33. Annulation

Une annulation est possible uniquement tant que le rail/provider le permet.

États possibles :

```text
CANCEL_REQUESTED
CANCELLED
TOO_LATE_TO_CANCEL
```

Une annulation locale ne doit jamais prétendre annuler un transfert externe déjà réglé.

## 34. Retour de fonds

Un payout peut revenir après succès apparent :

- compte fermé ;
- coordonnées invalides ;
- refus banque ;
- rejet opérateur ;
- conformité aval ;
- fonds non réclamés selon rail.

Le système crée alors un `PayoutReturn` avec écritures ledger correspondantes.

## 35. Reversal

Un reversal est distinct d’un return.

Il doit exiger une base métier et comptable explicite.

Aucun reversal ne doit supprimer l’opération originale.

## 36. Frais de payout

Le moteur de tarification central calcule :

- frais Mansa ;
- frais provider ;
- frais banque ;
- coût opérateur ;
- taxe ;
- remise ;
- subvention ;
- commission partenaire.

Le payout conserve la version de pricing appliquée.

## 37. Frais payés par l’organisation

Exemple :

```text
beneficiaryReceives = 100000 XOF
organizationFee = 500 XOF
totalDebit = 100500 XOF
```

Le bénéficiaire reçoit le montant annoncé.

## 38. Frais déduits

Si contractuellement autorisé :

```text
principal = 100000 XOF
fee = 500 XOF
beneficiaryReceives = 99500 XOF
```

Ce mode doit être explicite et visible avant validation.

## 39. Commission agent et partenaire

Les commissions calculées par les domaines agents ou pricing peuvent être payées via le moteur de payout.

La génération d’une commission et son paiement restent deux événements distincts.

## 40. Payout commerçant

Le commerçant peut choisir, selon contrat :

- règlement automatique quotidien ;
- règlement hebdomadaire ;
- payout manuel ;
- payout accéléré payant ;
- conservation temporaire sur balance commerçant.

Les fonds indisponibles, contestés ou réservés ne doivent pas être versés prématurément.

## 41. Marketplace

Une marketplace peut générer plusieurs payouts depuis une transaction client.

Exemple :

```text
client payment
-> platform fee
-> seller A payable
-> seller B payable
-> delivery partner payable
```

Chaque payable devient un droit à règlement distinct avant payout.

## 42. Secteur public

Le domaine doit permettre les paiements de masse de l’État :

- bourses ;
- aides ;
- subventions ;
- indemnités ;
- remboursements ;
- paiements fournisseurs ;
- reversements collectivités.

Exigences supplémentaires possibles :

- double validation ;
- budget ou ligne d’autorisation ;
- référence administrative ;
- liste bénéficiaires signée ;
- contrôle anti-doublon ;
- rapprochement par programme ;
- export auditeur.

## 43. Paie

Le moteur peut être utilisé par le domaine payroll pour exécuter les versements.

Le moteur payout ne calcule pas le salaire ; il exécute une instruction financière déjà validée.

## 44. Payout fournisseur

Une entreprise peut rattacher le payout à :

```text
supplierId
invoiceId
purchaseOrderId
contractId
costCenter
projectCode
```

Ces références sont informatives pour la comptabilité et l’audit.

## 45. Cut-off et jours ouvrés

Le moteur doit connaître les contraintes du rail :

- heure limite ;
- week-end ;
- jours fériés ;
- maintenance ;
- fenêtres de règlement.

Un payout soumis après cut-off doit afficher une date estimée réaliste lorsque possible.

## 46. Devises

Le payout doit utiliser une devise explicite.

Si conversion nécessaire, le domaine FX doit produire une quote séparée et versionnée.

Le moteur payout ne doit pas inventer un taux de change.

## 47. Limites

Les limites peuvent exister par :

- payout ;
- jour ;
- semaine ;
- mois ;
- bénéficiaire ;
- organisation ;
- utilisateur ;
- rail ;
- provider ;
- pays ;
- niveau KYC.

Les limites sont évaluées par le moteur central de limites et risque.

## 48. Notifications

Événements possibles :

```text
PAYOUT_CREATED
PAYOUT_APPROVAL_REQUIRED
PAYOUT_APPROVED
PAYOUT_SUBMITTED
PAYOUT_SUCCEEDED
PAYOUT_FAILED
PAYOUT_RETURNED
PAYOUT_ON_HOLD
BATCH_COMPLETED
```

Les notifications doivent éviter d’exposer des coordonnées bancaires complètes.

## 49. Reçus et preuves

Un payout réussi peut générer :

- référence Mansa ;
- montant ;
- devise ;
- bénéficiaire masqué ;
- destination masquée ;
- date ;
- statut ;
- référence provider lorsque approprié.

Une preuve Mansa ne doit pas être présentée comme preuve bancaire finale si le règlement externe reste en traitement.

## 50. Recherche et filtrage

Le portail doit permettre la recherche par :

```text
payoutId
externalReference
beneficiary
batchId
providerReference
amount
currency
status
date
organization
```

Les résultats respectent strictement le tenant et les permissions.

## 51. Audit

Événements à auditer :

- création ;
- modification avant validation ;
- ajout/changement bénéficiaire ;
- approbation ;
- rejet ;
- mise en hold ;
- levée de hold ;
- soumission provider ;
- retour provider ;
- annulation ;
- correction ;
- export ;
- changement de règle.

Chaque événement conserve acteur, date, organisation, motif et données minimales nécessaires.

## 52. Permissions

Permissions indicatives :

```text
payout.read
payout.create
payout.approve
payout.cancel
payout.retry
payout.review
payout.export
payout.beneficiary.manage
payout.batch.create
payout.batch.approve
payout.admin
```

L’absence de permission doit bloquer l’action côté serveur.

## 53. Isolation multi-tenant

Aucun utilisateur d’une organisation ne doit pouvoir lire, modifier, approuver ou exporter un payout d’une autre organisation sans autorisation explicite de plateforme.

Les identifiants fournis par le client ne doivent jamais suffire à contourner le filtrage tenant.

## 54. API

Endpoints indicatifs :

```text
POST /payouts
GET /payouts/:id
POST /payouts/:id/approve
POST /payouts/:id/cancel
POST /payout-batches
GET /payout-batches/:id
POST /payout-beneficiaries
GET /payout-beneficiaries/:id
```

Toute API d’écriture supporte idempotence et autorisation.

## 55. Observabilité

Métriques recommandées :

```text
payout_created_total
payout_success_total
payout_failure_total
payout_return_total
payout_processing_duration
provider_timeout_total
payout_manual_review_total
batch_item_failure_rate
reconciliation_break_total
```

Les métriques ne doivent pas contenir de données personnelles sensibles.

## 56. Rapprochement

Le rapprochement doit comparer :

```text
instruction Mansa
-> tentative provider
-> statut provider
-> fichier/rapport provider
-> débit bancaire ou opérateur
-> écritures ledger
-> montant reçu/retourné
```

Toute divergence devient une exception de rapprochement.

## 57. Fichiers de règlement

Certains partenaires peuvent utiliser des fichiers au lieu d’API temps réel.

Le système doit supporter :

- génération contrôlée ;
- chiffrement si requis ;
- signature ;
- transfert sécurisé ;
- accusé de réception ;
- import de statut ;
- réconciliation.

Aucun fichier sensible ne doit être envoyé par un canal non approuvé.

## 58. Mode hors ligne

Un terminal ou une application hors ligne ne doit pas pouvoir exécuter librement un payout externe définitif.

Il peut préparer une intention locale, mais l’autorisation financière et la soumission provider doivent être effectuées par le backend après synchronisation, sauf architecture spécifique expressément approuvée.

## 59. Erreurs fonctionnelles

Codes indicatifs :

```text
INSUFFICIENT_AVAILABLE_FUNDS
BENEFICIARY_NOT_VERIFIED
DESTINATION_INVALID
LIMIT_EXCEEDED
COMPLIANCE_HOLD
RISK_REVIEW_REQUIRED
PROVIDER_UNAVAILABLE
PROVIDER_STATE_UNKNOWN
DUPLICATE_IDEMPOTENCY_KEY
APPROVAL_REQUIRED
PAYOUT_NOT_CANCELLABLE
```

Les erreurs visibles ne doivent pas révéler des détails exploitables par un attaquant.

## 60. Tests obligatoires

Tests minimaux :

- création idempotente ;
- double clic / double requête ;
- fonds insuffisants ;
- bénéficiaire bloqué ;
- limite dépassée ;
- double validation ;
- séparation des tâches ;
- timeout provider ;
- webhook dupliqué ;
- webhook falsifié ;
- retour après succès ;
- batch partiellement invalide ;
- batch partiellement échoué ;
- isolation tenant ;
- changement de destination récent ;
- retry sûr ;
- absence de double débit ;
- reconciliation break ;
- concurrence sur solde ;
- annulation trop tardive.

## 61. Critères d’acceptation

Le domaine est acceptable lorsque :

1. un payout ne peut jamais débiter deux fois pour la même intention idempotente ;
2. les fonds sont réservés et comptabilisés via le ledger ;
3. les statuts sont issus d’une machine d’état contrôlée ;
4. les timeouts externes ne provoquent pas de resend aveugle ;
5. les bénéficiaires et destinations sont protégés ;
6. les contrôles conformité, risque et limites sont exécutés ;
7. les paiements de masse sont validables ligne par ligne ;
8. les approbations et la séparation des tâches sont disponibles ;
9. les payouts sont réconciliables avec les providers ;
10. les returns et reversals génèrent des écritures explicites ;
11. les permissions et l’isolation multi-tenant sont testées ;
12. les secrets et coordonnées sensibles ne sont pas exposés dans les logs ;
13. le même modèle fonctionne pour commerçants, entreprises, agents, partenaires et secteur public ;
14. les adapters permettent de changer ou d’ajouter un provider sans réécrire le domaine métier.

## 62. Principe final

Un payout Mansa est une instruction financière durable, traçable et réconciliable, et non un simple appel HTTP vers une banque ou un opérateur.

Chaque versement doit pouvoir être expliqué de bout en bout : qui a demandé, qui a approuvé, quelle source de fonds a été utilisée, quel bénéficiaire a été ciblé, quel rail a été sélectionné, quels frais ont été calculés, quelles tentatives externes ont eu lieu, quelles écritures ledger ont été créées et quel résultat final a été réconcilié.
