# Cahier des charges — Remboursements, reversals et ajustements financiers

## 1. Objet

Ce document définit les exigences Mansa relatives aux remboursements commerçants, annulations techniques, reversals, corrections financières et ajustements contrôlés.

Il complète les domaines déjà documentés de paiement, ledger, rapprochement, litiges/chargebacks, commerce, acquisition et support. Il ne les remplace pas.

L’objectif est de permettre de corriger une opération sans jamais supprimer l’historique financier, avec des règles strictes d’autorisation, d’idempotence, de traçabilité, de séparation des tâches et de protection contre la fraude.

## 2. Principes directeurs

1. aucune transaction financière comptabilisée ne doit être supprimée ou réécrite rétroactivement ;
2. toute correction après comptabilisation doit utiliser une écriture compensatrice ou une opération explicitement liée à l’originale ;
3. un remboursement commerçant est distinct d’un chargeback réseau carte, d’un litige client et d’un reversal technique ;
4. les remboursements ne doivent jamais permettre de rembourser plus que le montant éligible restant ;
5. les frais, commissions et taxes doivent être retraités selon des politiques explicites et versionnées ;
6. toute opération sensible doit être idempotente ;
7. les rôles pouvant initier, approuver et exécuter un ajustement doivent être séparables ;
8. aucun support, commerçant ou administrateur ne doit pouvoir créer librement de la valeur dans le ledger ;
9. toute décision doit être auditable avec motif, auteur, date, source, approbateur et référence d’origine ;
10. les remboursements et reversals doivent alimenter le rapprochement, le risk engine, les notifications et les rapports financiers.

## 3. Taxonomie

Mansa doit distinguer au minimum :

```text
MERCHANT_REFUND
PARTIAL_REFUND
FULL_REFUND
TECHNICAL_REVERSAL
AUTHORIZATION_REVERSAL
CAPTURE_REVERSAL
DUPLICATE_REVERSAL
FEE_REFUND
COMMISSION_REVERSAL
MANUAL_ADJUSTMENT_CREDIT
MANUAL_ADJUSTMENT_DEBIT
SETTLEMENT_ADJUSTMENT
FX_ADJUSTMENT
TAX_ADJUSTMENT
DISPUTE_ADJUSTMENT
CHARGEBACK_ADJUSTMENT
GOODWILL_CREDIT
SYSTEM_COMPENSATION
```

Chaque type doit posséder sa propre politique et ne doit pas être utilisé comme alias générique.

## 4. Différences conceptuelles

### 4.1 Remboursement

Le remboursement est une opération volontaire initiée après un paiement réussi afin de restituer tout ou partie du montant au payeur.

### 4.2 Reversal

Le reversal corrige une opération qui ne devait pas être finalisée ou dont le statut réel doit être neutralisé, par exemple après timeout, double capture empêchée, erreur technique ou annulation d’autorisation.

### 4.3 Ajustement

L’ajustement corrige une différence comptable, tarifaire, de commission, de règlement ou d’exploitation sous contrôle renforcé.

### 4.4 Chargeback

Le chargeback relève du domaine litiges/réseaux carte. Il peut produire des écritures liées au présent domaine mais conserve son workflow de preuve, représentation et décision réseau.

## 5. Entités recommandées

```text
Refund
RefundLine
RefundAllocation
Reversal
FinancialAdjustment
AdjustmentApproval
AdjustmentReason
RefundPolicy
RefundFeePolicy
RefundCommissionPolicy
RefundTaxPolicy
RefundEvent
RefundEvidence
RefundNotification
RefundReconciliation
RefundSettlementImpact
AuditLog
```

Chaque entité doit être reliée à l’organisation, au pays, à la devise, à l’environnement, à la transaction d’origine et aux acteurs concernés.

## 6. Référence à la transaction d’origine

Toute opération doit référencer une transaction originale immuable :

```text
originalTransactionId
originalPaymentId
originalLedgerEntryIds
merchantId
customerId
amountOriginal
currency
capturedAt
settlementStatus
paymentMethod
acquirerReference
```

Une correction orpheline doit être interdite sauf catégorie d’ajustement explicitement autorisée.

## 7. Montant remboursable

Le montant disponible doit être calculé côté serveur :

```text
refundableAmount
= capturedAmount
- successfulRefunds
- pendingReservedRefunds
- chargebackAmountsWhenMutuallyExclusive
- otherNonRefundableAllocations
```

Le client ou le commerçant ne fournit jamais lui-même la valeur de référence finale.

## 8. Remboursement total

Un remboursement total :

- restitue le montant éligible restant ;
- conserve la transaction originale ;
- crée des écritures compensatrices ;
- produit un reçu de remboursement ;
- met à jour le statut commercial sans modifier l’historique initial.

État commercial recommandé :

```text
PAID -> FULLY_REFUNDED
```

## 9. Remboursement partiel

Plusieurs remboursements partiels peuvent être effectués tant que leur somme ne dépasse pas le montant éligible.

Exemple :

```text
paiement original : 50 000 XOF
refund 1 : 10 000 XOF
refund 2 : 15 000 XOF
reste remboursable : 25 000 XOF
```

La concurrence doit être verrouillée afin que deux remboursements simultanés ne dépassent jamais le solde remboursable.

## 10. Remboursement par ligne de commande

Pour le commerce, Mansa peut relier un remboursement à :

```text
orderId
orderLineId
productId
quantity
unitAmount
shippingAmount
serviceFee
merchantDiscount
platformDiscount
taxAmount
```

Le remboursement financier doit rester distinct du retour physique de produit, mais les deux workflows peuvent être corrélés.

## 11. Motifs de remboursement

Catalogue configurable :

```text
CUSTOMER_REQUEST
PRODUCT_RETURNED
PRODUCT_NOT_AVAILABLE
DUPLICATE_PAYMENT
WRONG_AMOUNT
SERVICE_NOT_DELIVERED
ORDER_CANCELLED
MERCHANT_GESTURE
TECHNICAL_ERROR
FRAUD_CONFIRMED
REGULATORY_REQUIREMENT
OTHER
```

`OTHER` doit exiger un commentaire contrôlé.

## 12. États d’un remboursement

```text
CREATED
ELIGIBILITY_CHECK
APPROVAL_PENDING
APPROVED
FUNDS_RESERVED
PROCESSING
SUBMITTED_TO_PARTNER
PARTNER_PENDING
SUCCEEDED
PARTIALLY_SUCCEEDED
FAILED
RETRY_PENDING
REJECTED
CANCELLED
EXPIRED
UNKNOWN
RECONCILIATION_PENDING
RECONCILED
```

Les transitions doivent être gérées par machine d’état.

## 13. Initiateurs autorisés

Selon la politique :

- commerçant ;
- employé commerçant avec permission ;
- administrateur organisation ;
- support Mansa ;
- système automatique ;
- partenaire bancaire/acquéreur ;
- moteur de litige ;
- moteur de rapprochement.

Chaque initiateur doit être limité par rôle, montant, canal et périmètre organisationnel.

## 14. Permissions recommandées

```text
refund.create
refund.read
refund.approve
refund.cancel
refund.retry
refund.export
adjustment.create
adjustment.approve
adjustment.execute
adjustment.read
reversal.execute
refund.policy.manage
```

Une permission globale ne doit pas contourner l’isolation multi-tenant sans rôle privilégié explicitement audité.

## 15. Double validation

Les seuils peuvent exiger :

```text
MAKER -> CHECKER
```

Exemples :

- montant supérieur à un seuil ;
- remboursement après règlement commerçant ;
- remboursement manuel initié par support ;
- ajustement de commission ;
- ajustement de trésorerie ;
- opération sur compte État ;
- remboursement exceptionnel hors délai.

L’initiateur ne doit pas approuver sa propre opération lorsque la séparation des tâches est requise.

## 16. Délais d’éligibilité

La politique peut définir :

- délai maximum après paiement ;
- délai différent par canal ;
- délai différent par commerçant ;
- exceptions réglementaires ;
- exception approuvée manuellement.

Le dépassement du délai ne doit jamais être contourné silencieusement.

## 17. Paiement carte bancaire

Pour un paiement carte, le remboursement doit utiliser lorsque possible le rail et la référence du paiement original.

Mansa doit conserver :

```text
acquirerId
merchantAccountId
network
originalAcquirerReference
originalAuthorizationReference
originalCaptureReference
refundReference
partnerStatus
```

Mansa ne doit jamais prétendre qu’un remboursement carte est instantané si le réseau ou l’émetteur ne le garantit pas.

## 18. Autorisation non capturée

Lorsqu’une autorisation n’a pas encore été capturée, la bonne opération peut être une annulation/reversal d’autorisation plutôt qu’un remboursement.

```text
AUTHORIZED -> AUTHORIZATION_REVERSAL_PENDING -> REVERSED
```

Le système doit sélectionner le mécanisme selon le statut réel.

## 19. Wallet Mansa

Pour un paiement interne wallet :

- utiliser le ledger Mansa ;
- créditer via écriture compensatrice ;
- ne jamais modifier l’écriture originale ;
- appliquer les mêmes contrôles d’idempotence et d’autorisation.

Le remboursement peut être plus rapide qu’un rail externe, mais son statut doit rester explicite.

## 20. Mobile Money

Le remboursement Mobile Money dépend de la capacité de l’opérateur ou de la méthode de compensation disponible.

Modes possibles :

```text
PROVIDER_NATIVE_REFUND
COMPENSATING_TRANSFER
MANUAL_SETTLEMENT
NOT_SUPPORTED
```

Le produit doit afficher un comportement correct par opérateur et pays sans inventer une fonction non fournie par le partenaire.

## 21. Espèces

Un paiement en espèces ne peut pas être remboursé numériquement sans politique explicite.

Options :

- remboursement cash au même point de service ;
- crédit wallet ;
- bon/avoir ;
- virement bancaire ;
- traitement manuel contrôlé.

La méthode de remboursement doit être enregistrée séparément de la méthode de paiement originale.

## 22. Paiements État

Pour taxes, amendes, péages, droits administratifs ou autres paiements publics, le remboursement peut nécessiter une autorisation administrative spécifique.

Le système doit permettre :

```text
NO_REFUND
ADMIN_APPROVAL
LEGAL_DECISION_REQUIRED
AUTOMATIC_REVERSAL_ONLY
PARTIAL_REFUND_ALLOWED
```

Une politique nationale ou par service public doit pouvoir être configurée et auditée.

## 23. Péages — exigences de référence

Le domaine péage conserve explicitement :

- solution A : péage automatique classique avec barrière ;
- solution B : télépéage UHF RFID avec barrière ;
- évolution future optionnelle vers free-flow sans remplacer A ou B ;
- paiements classiques possibles : billets et pièces FCFA, EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money selon activation ;
- Mobile Money configurable par administration au niveau national, réseau, poste ou voie, avec date d’effet et audit ;
- télépéage initial : tag UHF RFID passif lié véhicule/compte, lecteur/antenne, contrôleur local, relais OPEN, barrière, capteurs ;
- fonctionnement local/hors-ligne sécurisé, resynchronisation et absence de double débit ;
- matériel multi-fournisseurs derrière adaptateurs ;
- niveaux : automatique complet, semi-automatique sécurisé, poste numérisé à faible coût ;
- déploiement progressif ;
- achat matériel direct par État/concessionnaire ou fourniture/intégration/revente Mansa ;
- marque blanche État/concessionnaire avec `Propulsé par Mansa` facultatif ;
- rapprochement anti-corruption véhicule, catégorie, tarif, paiement, ouverture et passage ;
- toute ouverture manuelle auditée.

Un remboursement de péage ne doit jamais supprimer le passage véhicule ni l’événement de barrière. Il crée une correction financière distincte.

## 24. Frais

Chaque frais doit posséder une politique de remboursement :

```text
NON_REFUNDABLE
FULLY_REFUNDABLE
PRO_RATA
REFUND_IF_TECHNICAL_ERROR
REFUND_IF_MERCHANT_FAULT
MANUAL_DECISION
```

Exemples : frais Mansa, frais agent, frais acquéreur, frais opérateur, frais de change, frais de livraison.

## 25. Commissions

Lors d’un remboursement, la commission initialement créditée peut être :

```text
KEEP
REVERSE_FULL
REVERSE_PRO_RATA
REVERSE_AFTER_SETTLEMENT
MANUAL_REVIEW
```

Le moteur doit générer des écritures séparées et explicites.

## 26. Taxes

Le traitement des taxes doit dépendre de la juridiction et de la nature du produit.

Mansa doit conserver :

- base taxée originale ;
- taxe originale ;
- part remboursée ;
- taxe remboursée ;
- référence facture/avoir ;
- règles applicables.

Le moteur ne doit pas deviner un traitement fiscal non configuré.

## 27. Promotions et remises

Pour une commande avec promotion :

- conserver le prix brut ;
- conserver la remise commerçant ;
- conserver la remise Mansa ;
- conserver le montant réellement payé ;
- définir comment répartir un remboursement partiel.

Les règles d’allocation doivent être déterministes.

## 28. Fidélité

Un remboursement peut déclencher :

- retrait de points gagnés ;
- restitution de points dépensés ;
- ajustement de cashback ;
- réévaluation d’un statut de fidélité.

Ces effets doivent être idempotents et corrélés au refund.

## 29. Cashback

Politique possible :

```text
REVERSE_ON_REFUND
PRO_RATA_REVERSAL
KEEP_AFTER_THRESHOLD
MANUAL
```

Le cashback ne doit pas permettre une boucle de gain via paiement puis remboursement.

## 30. Change et multi-devises

Pour une transaction en devise étrangère, conserver séparément :

```text
originalTransactionCurrency
originalSettlementCurrency
originalFxRate
refundTransactionCurrency
refundSettlementCurrency
refundFxRate
fxDifference
```

La politique doit préciser qui supporte l’écart de change.

## 31. Ledger

Exemple simplifié :

```text
paiement original
DR customer 10 000
CR merchant 9 800
CR fee 200

remboursement
DR merchant/refund_reserve 9 800
DR fee_refund 200
CR customer 10 000
```

Les écritures réelles dépendent de l’architecture comptable mais doivent toujours équilibrer débit et crédit.

## 32. Réserves commerçant

Le système peut disposer de :

- solde disponible ;
- solde en règlement ;
- réserve de remboursement ;
- réserve risque ;
- créance Mansa.

Un remboursement ne doit pas créer un solde négatif non contrôlé.

## 33. Commerçant sans solde suffisant

Politiques possibles :

```text
REJECT_REFUND
USE_REFUND_RESERVE
USE_PENDING_SETTLEMENT
CREATE_MERCHANT_RECEIVABLE
DEBIT_LINKED_BANK_ACCOUNT_IF_CONTRACTED
MANUAL_REVIEW
```

La politique doit être contractuelle et configurable.

## 34. Règlement déjà effectué

Si le commerçant a déjà reçu les fonds :

- créer une créance ou débit de règlement futur ;
- ne jamais modifier un fichier de règlement historique ;
- refléter l’impact dans le prochain cycle ;
- rapprocher l’ajustement avec la banque/acquéreur.

## 35. Idempotence

Chaque requête sensible doit accepter une `idempotencyKey`.

Clé logique recommandée :

```text
organizationId + originalTransactionId + refundRequestId + operationType
```

Un retry doit retourner le résultat existant plutôt que recréer une écriture.

## 36. Concurrence

Le système doit empêcher :

- double remboursement simultané ;
- remboursement et chargeback incompatibles exécutés en parallèle ;
- reversal après remboursement sans arbitrage ;
- modification de montant après approbation.

Utiliser verrou logique, version optimiste ou transaction DB selon l’architecture.

## 37. État UNKNOWN

En cas de timeout partenaire :

```text
PROCESSING -> UNKNOWN
```

Le système ne doit pas automatiquement conclure à l’échec.

Un worker doit :

1. interroger le partenaire ;
2. vérifier les webhooks ;
3. vérifier le ledger ;
4. vérifier les références externes ;
5. résoudre vers succès, échec ou revue manuelle.

## 38. Webhooks partenaires

Les webhooks doivent être :

- authentifiés ;
- signés si le partenaire le permet ;
- horodatés ;
- protégés anti-replay ;
- idempotents ;
- journalisés sans secrets.

Une notification reçue deux fois ne crée pas deux remboursements.

## 39. Retry

Les retries automatiques doivent utiliser :

- backoff ;
- limite d’essais ;
- état idempotent ;
- circuit breaker ;
- dead-letter ou revue manuelle après échec persistant.

## 40. Reversal technique automatique

Déclencheurs possibles :

- paiement débité mais commande non créée ;
- capture confirmée localement mais rejetée par le partenaire ;
- transaction dupliquée ;
- timeout résolu comme échec ;
- erreur de terminal avant délivrance du service ;
- flux hors-ligne impossible à réconcilier.

Le moteur doit vérifier l’état réel avant compensation.

## 41. Annulation avant capture

Une annulation pré-capture doit utiliser le mécanisme du rail concerné et ne pas être présentée comme un remboursement si aucun débit final n’a eu lieu.

## 42. Ajustements manuels

Les ajustements manuels doivent être exceptionnels.

Champs obligatoires :

```text
adjustmentId
adjustmentType
amount
currency
accountId
originalReference
reasonCode
reasonText
createdBy
approvedBy
createdAt
approvedAt
evidenceIds
```

Aucun champ ne doit permettre de masquer l’auteur réel.

## 43. Seuils d’approbation

Exemple :

```text
0 - 50 000 XOF: rôle A
50 001 - 500 000 XOF: rôle B + checker
> 500 000 XOF: rôle C + double approbation
```

Les valeurs sont configurables et non codées en dur.

## 44. Goodwill credit

Un geste commercial financé par Mansa ne doit pas être comptabilisé comme remboursement du commerçant.

Il doit utiliser une catégorie distincte afin de préserver les responsabilités financières.

## 45. Fraude

Signaux :

- taux de remboursement anormalement élevé ;
- remboursement immédiat après paiement ;
- nombreux refunds fractionnés ;
- employé commerçant remboursant vers comptes liés ;
- contournement de plafonds ;
- remboursement après retrait/cash-out du produit initial ;
- concentration sur un appareil ;
- changements répétés d’approbateur ;
- remboursements sans commande ;
- ajustements manuels fréquents.

Le risk engine peut bloquer, challenger ou envoyer en revue.

## 46. Anti-abus employé commerçant

Un employé ne doit pouvoir rembourser que :

- les points de vente autorisés ;
- les montants sous son seuil ;
- les transactions visibles dans son scope ;
- les méthodes autorisées.

Les remboursements à soi-même ou à des comptes liés doivent être détectables.

## 47. Multi-tenant

Toutes les requêtes doivent filtrer par organisation.

Un commerçant A ne doit jamais consulter, initier ou approuver le remboursement d’un commerçant B, même avec un identifiant de transaction valide.

Les tests négatifs multi-tenant sont obligatoires.

## 48. Notifications client

Notifier :

- remboursement initié ;
- en attente ;
- accepté ;
- refusé ;
- réussi ;
- délai externe ;
- remboursement partiel ;
- montant final.

Ne jamais promettre une date de crédit non garantie par le rail.

## 49. Notifications commerçant

Afficher :

- montant ;
- transaction originale ;
- employé initiateur ;
- approbation ;
- impact sur solde ;
- impact sur règlement ;
- statut final.

## 50. Reçu de remboursement

Contenu recommandé :

```text
refundReference
originalPaymentReference
merchantName
amount
currency
refundMethod
status
createdAt
completedAt
```

Le reçu ne doit pas exposer de PAN complet, secret, PIN ou donnée privée inutile.

## 51. Facture et avoir

Lorsque nécessaire, le remboursement peut déclencher un avoir distinct de la facture originale.

La facture originale n’est pas supprimée.

## 52. Journal d’audit

Événements :

```text
REFUND_CREATED
REFUND_APPROVAL_REQUESTED
REFUND_APPROVED
REFUND_REJECTED
REFUND_SUBMITTED
REFUND_SUCCEEDED
REFUND_FAILED
REFUND_CANCELLED
REVERSAL_CREATED
REVERSAL_SUCCEEDED
ADJUSTMENT_CREATED
ADJUSTMENT_APPROVED
ADJUSTMENT_EXECUTED
POLICY_CHANGED
```

Chaque événement contient acteur, rôle, tenant, appareil, IP si pertinente, date et corrélation.

## 53. Rapprochement

Comparer :

```text
Mansa refund ledger
vs payment processor refunds
vs bank/acquirer settlement
vs merchant settlement adjustments
vs wallet credits
vs Mobile Money partner status
```

Les différences ne doivent pas être automatiquement effacées.

## 54. États de rapprochement

```text
MATCHED
MISSING_INTERNAL
MISSING_EXTERNAL
AMOUNT_MISMATCH
CURRENCY_MISMATCH
DUPLICATE_EXTERNAL
PENDING_PARTNER
MANUAL_REVIEW
RESOLVED
```

## 55. Reporting

Indicateurs :

- volume de refunds ;
- taux par commerçant ;
- montant moyen ;
- taux de partial refund ;
- délais de traitement ;
- échecs partenaires ;
- montants en attente ;
- ajustements manuels ;
- impact commissions ;
- impact fraude ;
- exposition commerçant.

## 56. Analytics anti-fraude

Comparer les remboursements par :

```text
merchant
employee
device
country
paymentMethod
product
hour
amountBand
customerSegment
reasonCode
```

## 57. API recommandée

```text
POST /payments/{paymentId}/refunds
GET /refunds/{refundId}
GET /payments/{paymentId}/refunds
POST /refunds/{refundId}/approve
POST /refunds/{refundId}/reject
POST /refunds/{refundId}/cancel
POST /refunds/{refundId}/retry
POST /payments/{paymentId}/reversals
GET /reversals/{reversalId}
POST /adjustments
GET /adjustments/{adjustmentId}
POST /adjustments/{adjustmentId}/approve
POST /adjustments/{adjustmentId}/execute
GET /refund-policies
PUT /refund-policies/{id}
```

## 58. Contrats API

Chaque mutation doit accepter :

```text
Idempotency-Key
Correlation-Id
Actor-Context
Organization-Context
```

Le contexte acteur doit être dérivé de l’authentification et non accepté aveuglément depuis le client.

## 59. Modèle de données minimal

`Refund` :

```text
id
organizationId
originalTransactionId
amount
currency
type
reasonCode
status
initiatedBy
approvedBy
idempotencyKey
providerReference
createdAt
updatedAt
completedAt
```

`FinancialAdjustment` :

```text
id
organizationId
accountId
originalReference
adjustmentType
amount
currency
reasonCode
status
createdBy
approvedBy
executedAt
```

## 60. Sécurité

Exigences :

- RBAC/ABAC selon périmètre ;
- isolation tenant ;
- MFA ou step-up pour opérations sensibles ;
- rate limiting ;
- validation stricte des montants ;
- aucune confiance dans le prix envoyé par le front ;
- secrets uniquement dans gestionnaire sécurisé ;
- chiffrement transport ;
- logs minimisés ;
- rotation et révocation des accès privilégiés.

## 61. Protection contre les montants négatifs

Les API ne doivent jamais accepter un montant <= 0 pour un refund standard.

Les crédits/débits administratifs passent par `FinancialAdjustment` avec règles séparées.

## 62. Précision monétaire

Ne jamais utiliser de flottant binaire pour les montants.

Utiliser unités mineures entières ou type décimal exact selon devise.

## 63. XOF/FCFA

Pour XOF :

- gérer les montants en unité entière ;
- conserver `currency = XOF` ;
- ne pas appliquer de décimales fictives visibles ;
- valider les règles des partenaires concernés.

## 64. Observabilité

Métriques :

```text
refund_created_total
refund_success_total
refund_failed_total
refund_pending_duration
refund_partner_error_total
refund_amount_total
manual_adjustment_total
reversal_total
reconciliation_mismatch_total
```

Les labels ne doivent pas contenir de donnée personnelle à haute cardinalité.

## 65. Alertes

Déclencher alerte sur :

- forte hausse du taux de refunds ;
- montant inhabituel ;
- partenaire en erreur ;
- remboursements bloqués ;
- rapprochement incohérent ;
- ajustement manuel élevé ;
- dépassement d’un seuil de créance commerçant.

## 66. Tests unitaires

Tester :

- calcul remboursable ;
- limites cumulées ;
- partial refunds ;
- politiques frais ;
- commissions ;
- taxes ;
- machine d’état ;
- permissions ;
- rounding exact.

## 67. Tests de concurrence

Scénario obligatoire : deux requêtes remboursent simultanément le dernier solde remboursable.

Une seule combinaison valide doit être comptabilisée.

## 68. Tests d’idempotence

Renvoyer la même requête 2, 10 ou 100 fois ne doit produire qu’une seule opération financière.

## 69. Tests de sécurité

Tester notamment :

- merchant A -> refund transaction merchant B : refus ;
- support sans permission -> refus ;
- modification du montant après approbation : refus ;
- refund supérieur au solde : refus ;
- replay webhook : pas de double crédit ;
- identifiant aléatoire d’un autre tenant : aucune fuite.

## 70. Tests partenaires

Simuler :

- succès immédiat ;
- pending ;
- timeout ;
- webhook tardif ;
- réponse dupliquée ;
- erreur 5xx ;
- statut inconnu ;
- succès après timeout.

## 71. Tests ledger

Vérifier :

- débit = crédit ;
- corrélation à l’originale ;
- aucune suppression ;
- solde cohérent ;
- rollback transactionnel en cas d’échec interne.

## 72. Environnements

```text
DEMO
TEST
RECETTE
STAGING
PRODUCTION
```

Les remboursements de test ne doivent jamais atteindre un rail réel sans configuration explicite.

## 73. Déploiement progressif

Feature flags possibles :

```text
refunds.enabled
partialRefunds.enabled
merchantRefunds.enabled
mobileMoneyRefunds.enabled
manualAdjustments.enabled
refundApproval.enabled
```

Chaque activation doit être par environnement et organisation.

## 74. Migration

Lors de l’introduction du module :

1. inventorier les flux de correction existants ;
2. interdire les modifications directes de ledger ;
3. migrer vers des opérations compensatrices ;
4. ajouter les références d’origine ;
5. réconcilier les anciens états ;
6. activer progressivement les nouveaux workflows.

## 75. Gouvernance des politiques

Toute modification de politique conserve :

```text
oldValue
newValue
effectiveAt
changedBy
approvedBy
reason
version
```

Une politique future peut être planifiée sans altérer rétroactivement les remboursements existants.

## 76. Données personnelles

Conserver uniquement les données nécessaires.

Les exports destinés aux commerçants ou opérateurs doivent masquer les données sensibles non nécessaires à la gestion du remboursement.

## 77. Rétention

La rétention doit respecter les obligations comptables, réglementaires et contractuelles du pays.

Les données d’audit financières nécessaires ne doivent pas disparaître avec la suppression d’un profil utilisateur.

## 78. Support

Le support doit voir :

- timeline ;
- statuts ;
- références ;
- erreurs normalisées ;
- prochaines actions possibles ;
- historique de retry ;
- rapprochement.

Il ne doit pas disposer par défaut d’un bouton générique « créditer compte ».

## 79. Back-office

Fonctions :

- recherche ;
- filtres ;
- revue ;
- approbation ;
- export ;
- anomalies ;
- lecture ledger liée ;
- historique partenaire ;
- justificatifs ;
- contrôle des politiques.

## 80. UX commerçant

Avant confirmation afficher :

```text
montant original
montant déjà remboursé
montant demandé
reste après remboursement
impact estimé sur solde/règlement
frais éventuellement non restitués
```

Le bouton final doit exprimer clairement l’action financière.

## 81. UX client

Le client doit distinguer :

```text
Remboursement demandé
Remboursement en cours
Remboursement envoyé
Remboursement crédité par Mansa
Délai bancaire externe éventuel
```

Éviter de confondre « envoyé au réseau » et « visible sur le compte bancaire ».

## 82. Relations avec litiges

Lorsqu’un litige est ouvert :

- détecter tout refund existant ;
- empêcher une double indemnisation ;
- partager les références ;
- ajuster le montant litigieux restant ;
- conserver la timeline complète.

## 83. Relations avec commandes

Une commande peut avoir :

```text
paymentStatus
fulfillmentStatus
returnStatus
refundStatus
```

Ces statuts sont distincts.

## 84. Relations avec stock

Un remboursement ne remet pas automatiquement un produit en stock.

Le retour logistique décide de la réintégration selon état et validation.

## 85. Relations avec abonnements

Pour un remboursement d’abonnement :

- décider si le service continue ;
- proratiser si prévu ;
- ajuster la prochaine échéance ;
- éviter un remboursement + service gratuit non prévu.

## 86. Relations avec factures de services

Pour électricité, eau, télécom ou factures : le remboursement dépend du fournisseur et du statut de paiement.

Mansa ne doit pas promettre une annulation lorsque le fournisseur a déjà consommé/validé le paiement.

## 87. Relations avec agent cash-in/cash-out

Un ajustement lié à un agent doit être corrélé à sa session, sa liquidité et son rapprochement.

Une différence de caisse ne doit pas être « corrigée » via un refund générique.

## 88. Contrôles administrateur

Le Super Admin peut gérer les politiques globales mais les actions financières sensibles restent journalisées et, si configuré, soumises à approbation indépendante.

Aucun rôle ne doit être techniquement invisible dans l’audit.

## 89. Exigences de conformité

Le module doit pouvoir supporter les exigences locales applicables en matière de :

- conservation comptable ;
- lutte contre fraude ;
- KYC/KYB ;
- protection des consommateurs ;
- traitement fiscal ;
- obligations des prestataires de paiement.

Les règles juridiques réelles restent configurées par pays et partenaires.

## 90. Critères d’acceptation MVP

Le MVP est acceptable si :

1. refund total et partiel fonctionnent ;
2. montant remboursable est calculé serveur ;
3. aucune double exécution n’est possible ;
4. wallet et au moins un provider mock sont supportés ;
5. ledger utilise des écritures compensatrices ;
6. RBAC et multi-tenant sont testés ;
7. approval threshold existe ;
8. audit complet existe ;
9. rapprochement est possible ;
10. notifications sont émises ;
11. les états UNKNOWN sont récupérables ;
12. tests concurrence/idempotence passent.

## 91. Critères de production

Avant production :

- tests partenaires réels ;
- politiques par pays validées ;
- procédures support ;
- seuils de risque ;
- monitoring ;
- alertes ;
- rapprochement quotidien ;
- gestion des incidents ;
- revue sécurité ;
- revue comptable ;
- stratégie rollback ;
- documentation d’exploitation.

## 92. Résultat attendu

Mansa doit disposer d’un moteur de correction financière générique, sûr et multi-canal qui permet de rembourser ou compenser une opération sans jamais casser l’intégrité du ledger, sans double indemnisation et sans donner aux opérateurs un pouvoir arbitraire de création de valeur.
