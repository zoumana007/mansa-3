# Cahier des charges — Factures avancées

## 1. Objet

Ce document définit le domaine **Factures avancées** de Mansa. Il couvre la réception, l’import, la normalisation, l’affichage, le paiement, la planification, le suivi, le rapprochement, la preuve de paiement et l’administration de factures émises par des fournisseurs privés ou publics.

Le domaine doit fonctionner pour les particuliers, commerçants, entreprises, administrations et autres organisations autorisées. Il doit être utilisable au Mali puis extensible à d’autres pays sans coder en dur un fournisseur, un format ou un rail de paiement.

Le module ne doit pas confondre :

- la **facture** : créance ou document à payer ;
- le **mandat de débit** : autorisation préalable de débit ;
- le **paiement** : exécution financière ;
- le **reçu** : preuve de l’opération ;
- l’**abonnement** : relation commerciale récurrente ;
- le **ledger** : vérité comptable interne Mansa.

## 2. Objectifs

Le module doit permettre notamment de :

1. centraliser les factures d’un utilisateur ou d’une organisation ;
2. connecter plusieurs fournisseurs via adaptateurs ;
3. importer manuellement une facture lorsque le fournisseur n’a pas d’API ;
4. récupérer les montants dus lorsqu’une intégration partenaire le permet ;
5. payer une facture via les moyens autorisés ;
6. programmer un paiement futur ;
7. utiliser un mandat ou un autopay lorsque le rail et le partenaire le permettent ;
8. envoyer des rappels avant échéance ;
9. détecter les doublons ;
10. gérer paiements partiels si le fournisseur l’autorise ;
11. payer plusieurs factures en une opération utilisateur tout en gardant des sous-transactions distinctes ;
12. générer et conserver les preuves ;
13. rapprocher paiement, fournisseur et facture ;
14. supporter annulations, échecs, remboursements et litiges ;
15. administrer les fournisseurs, catégories, pays, devises, canaux et commissions ;
16. offrir une API et des webhooks aux partenaires autorisés ;
17. fonctionner avec une architecture multi-pays, multi-devise, multi-tenant et multi-fournisseur ;
18. préserver la minimisation des données et l’audit.

## 3. Périmètre fonctionnel

Le module couvre notamment :

- électricité ;
- eau ;
- téléphone ;
- Internet ;
- télévision ;
- éducation ;
- frais scolaires ;
- assurance lorsque le paiement est matérialisé par une facture ;
- loyer lorsque le partenaire ou l’organisation utilise une facture ;
- services publics ;
- taxes ou redevances facturées ;
- fournisseurs B2B ;
- fournisseurs B2C ;
- factures commerçants ;
- factures d’entreprise ;
- factures d’administration ;
- factures ponctuelles ;
- factures récurrentes ;
- échéanciers facturés ;
- paiements groupés ;
- rappels ;
- reçus ;
- rapprochement ;
- remboursement ;
- litige ;
- reporting ;
- API partenaires ;
- webhooks ;
- sandbox.

Exemples de fournisseurs ou secteurs tels que EDM, eau, télécoms, écoles ou services publics doivent être traités comme **catégories d’intégration** et non comme dépendances codées en dur. Toute disponibilité réelle dépend d’un contrat, d’une API, d’un agrégateur ou d’un rail actif.

## 4. Non-objectifs

Ce domaine ne doit pas :

- remplacer le moteur de paiement central ;
- remplacer le ledger ;
- remplacer le moteur de mandats de débit ;
- inventer un accès API à un fournisseur non partenaire ;
- stocker un PIN, CVV, secret Mobile Money, mot de passe fournisseur ou clé privée ;
- considérer qu’un paiement réussi côté Mansa équivaut toujours à une facture acquittée côté fournisseur sans confirmation ou politique de rapprochement ;
- imposer les mêmes règles de remboursement à tous les fournisseurs ;
- garantir le paiement partiel si le fournisseur ne l’accepte pas ;
- supposer qu’une référence client est unique mondialement ;
- modifier rétroactivement les frais appliqués à une transaction historique.

## 5. Principes directeurs

1. Toute facture doit appartenir à un fournisseur clairement identifié.
2. Une facture doit avoir un identifiant interne Mansa stable, indépendamment des références externes.
3. La source de la facture doit être connue et auditée.
4. L’état facture et l’état paiement doivent être distincts.
5. Toute opération financière doit être idempotente.
6. Le module doit supporter les réponses asynchrones de fournisseurs.
7. Les montants doivent être conservés en unités monétaires sûres, jamais en flottants binaires.
8. Les règles de frais sont résolues par le **Pricing & Commission Engine** central.
9. Toute transaction conserve un snapshot immuable du tarif appliqué.
10. Les adaptateurs fournisseurs doivent être remplaçables sans refonte du domaine.
11. Une intégration indisponible doit dégrader proprement sans corrompre l’état de la facture.
12. Les données personnelles doivent être minimisées et limitées au besoin métier.
13. Les opérations sensibles doivent être auditées.
14. Les politiques pays, partenaire et fournisseur doivent être configurables.
15. Les paiements en réseau faible doivent être conçus pour éviter les doubles débits.

## 6. Acteurs

### 6.1 Utilisateur particulier

Peut consulter ses factures, ajouter une référence client, importer une facture, payer, programmer un rappel, activer un autopay si disponible et consulter les reçus.

### 6.2 Utilisateur entreprise

Peut gérer plusieurs fournisseurs, centres de coûts, équipes, règles d’approbation, factures à payer, paiements groupés, justificatifs et exports comptables.

### 6.3 Fournisseur

Peut, selon contrat :

- publier ou exposer des factures ;
- confirmer le montant dû ;
- accepter des paiements ;
- confirmer l’imputation ;
- fournir un reçu fournisseur ;
- signaler annulation ou correction ;
- recevoir des webhooks ou appels API Mansa.

### 6.4 Agrégateur

Peut représenter plusieurs fournisseurs derrière un adaptateur unique, sans que Mansa confonde l’agrégateur avec le fournisseur final.

### 6.5 Agent ou opérateur support

Peut assister un utilisateur dans les limites de ses permissions, sans pouvoir modifier arbitrairement une facture ou forcer un succès financier.

### 6.6 Administrateur Mansa

Gère les fournisseurs, configurations, pays, devises, catégories, limites, frais, feature flags, règles de risque et opérations nécessitant une intervention autorisée.

## 7. Parcours utilisateur principaux

### 7.1 Ajouter un fournisseur

```text
OUVRIR_FACTURES
→ CHOISIR_CATEGORIE
→ CHOISIR_FOURNISSEUR
→ SAISIR_REFERENCE_CLIENT
→ VERIFIER_REFERENCE_SI_API_DISPONIBLE
→ CONFIRMER
→ ENREGISTRER_LIEN_CLIENT_FOURNISSEUR
```

### 7.2 Récupérer les factures

```text
DEMANDER_SYNCHRONISATION
→ RESOUDRE_ADAPTATEUR
→ AUTHENTIFIER_PARTENAIRE
→ INTERROGER_FOURNISSEUR
→ NORMALISER_REPONSE
→ DEDUPLIQUER
→ METTRE_A_JOUR_ETATS
→ NOTIFIER_SI_NOUVELLE_FACTURE
```

### 7.3 Import manuel

```text
IMPORTER_DOCUMENT_OU_SAISIR_INFOS
→ EXTRAIRE_OU_SAISIR_CHAMPS
→ CONFIRMER_MONTANT_REFERENCE_DATE
→ MARQUER_SOURCE_MANUAL
→ ENREGISTRER
```

Une facture importée manuellement ne doit pas être présentée comme vérifiée par le fournisseur tant qu’aucune vérification n’a eu lieu.

### 7.4 Paiement ponctuel

```text
OUVRIR_FACTURE
→ RAFRAICHIR_MONTANT_SI_NECESSAIRE
→ CHOISIR_MOYEN_PAIEMENT
→ CALCULER_FRAIS
→ AFFICHER_TOTAL
→ AUTHENTIFIER_SI_REQUIS
→ CREER_PAYMENT_INTENT
→ EXECUTER_PAIEMENT
→ CONFIRMER_FOURNISSEUR
→ RAPPROCHER
→ GENERER_RECU
```

### 7.5 Paiement programmé

```text
CHOISIR_FACTURE
→ DEFINIR_DATE
→ CHOISIR_SOURCE
→ VERIFIER_ELIGIBILITE
→ CREER_SCHEDULE
→ RAPPELER_AVANT_EXECUTION
→ EXECUTER_A_DATE
```

Un paiement programmé n’est pas un mandat permanent sauf si un mandat distinct a été créé.

### 7.6 Autopay

```text
CHOISIR_FOURNISSEUR
→ DEFINIR_REGLE
→ CREER_OU_LIER_MANDAT
→ CONSENTEMENT
→ ACTIVER
→ A_CHAQUE_FACTURE_ELIGIBLE
→ VERIFIER_PLAFONDS_ET_RISQUE
→ EXECUTER
```

### 7.7 Paiement groupé

```text
SELECTIONNER_PLUSIEURS_FACTURES
→ VERIFIER_ELIGIBILITE_DE_CHAQUE_FACTURE
→ CALCULER_FRAIS_PAR_LIGNE
→ AFFICHER_TOTAL
→ CONFIRMER
→ CREER_BATCH
→ EXECUTER_SOUS_OPERATIONS
→ RAPPROCHER_INDEPENDAMMENT
```

L’échec d’une facture ne doit pas masquer le succès d’une autre.

## 8. Modèle de données recommandé

```text
BillProvider
BillProviderCountryConfig
BillProviderCapability
BillProviderEndpointConfig
BillProviderCustomerLink
BillProviderAccountReference
Bill
BillVersion
BillLineItem
BillDocument
BillSource
BillStatusHistory
BillPaymentIntent
BillPayment
BillPaymentAttempt
BillPaymentAllocation
BillBatch
BillBatchItem
BillSchedule
BillReminderPolicy
BillAutopayPolicy
BillProviderConfirmation
BillReconciliation
BillReceipt
BillDispute
BillRefund
BillAdjustment
BillWebhookEvent
BillAuditLog
BillFeeSnapshot
BillNotification
```

## 9. Entité BillProvider

Champs recommandés :

```text
providerId
legalName
displayName
providerType
countryCode
status
integrationMode
settlementMode
reconciliationMode
createdAt
updatedAt
```

Types possibles :

```text
UTILITY
TELCO
ISP
TV
EDUCATION
GOVERNMENT
INSURANCE
LANDLORD
MERCHANT
ENTERPRISE
AGGREGATOR
OTHER
```

## 10. Capacités fournisseur

Les capacités doivent être explicites :

```text
CAN_LOOKUP_CUSTOMER
CAN_FETCH_BILLS
CAN_VALIDATE_AMOUNT
CAN_ACCEPT_PAYMENT
CAN_ACCEPT_PARTIAL_PAYMENT
CAN_ACCEPT_OVERPAYMENT
CAN_CONFIRM_POSTING
CAN_CANCEL_PAYMENT
CAN_REFUND
CAN_SEND_BILL_WEBHOOKS
CAN_SEND_PAYMENT_WEBHOOKS
CAN_SUPPORT_AUTOPAY
CAN_SUPPORT_BATCH
CAN_RETURN_RECEIPT
```

L’interface client doit se baser sur ces capacités et non sur des suppositions.

## 11. Modes d’intégration

```text
DIRECT_API
AGGREGATOR_API
WEBHOOK_PUSH
FILE_BATCH
SFTP_BATCH
MANUAL_REFERENCE
MANUAL_IMPORT
OTHER_ADAPTER
```

Les secrets d’intégration doivent être stockés dans un système de secrets et jamais dans les documents, le dépôt Git ou les logs.

## 12. Entité Bill

Champs minimaux :

```text
billId
providerId
customerLinkId
externalBillReference
accountReference
countryCode
currency
amountDue
amountPaid
amountRemaining
issueDate
dueDate
status
sourceType
sourceReference
createdAt
updatedAt
```

Champs facultatifs :

```text
billingPeriodStart
billingPeriodEnd
serviceAddressMasked
meterReferenceMasked
contractReferenceMasked
invoiceNumber
description
minimumPayableAmount
maximumPayableAmount
providerMetadata
```

## 13. Statuts facture

```text
DRAFT
IMPORTED_UNVERIFIED
OPEN
PARTIALLY_PAID
PAYMENT_PENDING
PAID_PENDING_PROVIDER_CONFIRMATION
PAID
OVERDUE
CANCELLED
VOID
DISPUTED
REFUNDED
REFUND_PARTIAL
ERROR
```

Les transitions doivent être contrôlées. Exemple : `PAID` ne doit pas redevenir `OPEN` sans événement de correction, annulation ou rapprochement explicite.

## 14. Versions de facture

Un fournisseur peut corriger une facture. Les changements majeurs doivent créer une `BillVersion` :

- montant ;
- échéance ;
- référence ;
- lignes ;
- taxes ;
- statut ;
- correction fournisseur.

Une facture payée doit conserver la version utilisée au moment du paiement.

## 15. Lignes de facture

`BillLineItem` peut contenir :

```text
lineId
billId
label
quantity
unitAmount
subtotal
taxAmount
totalAmount
category
```

La présence des lignes dépend du fournisseur.

## 16. Liaison client-fournisseur

`BillProviderCustomerLink` relie un utilisateur/tenant à un compte fournisseur.

Champs :

```text
linkId
ownerType
ownerId
providerId
customerReferenceMasked
providerCustomerToken
verificationStatus
verifiedAt
status
```

Les références sensibles doivent être masquées dans les interfaces et logs lorsque nécessaire.

## 17. Vérification de référence

Lorsqu’un fournisseur propose un lookup, Mansa peut afficher un résultat de vérification minimal :

- nom partiellement masqué ;
- type de contrat ;
- statut ;
- zone ou agence si utile.

Ne jamais exposer plus de données qu’il n’en faut pour confirmer que la référence est correcte.

## 18. Sources de facture

```text
PROVIDER_API
PROVIDER_WEBHOOK
AGGREGATOR
MANUAL_UPLOAD
MANUAL_ENTRY
OCR_ASSISTED_IMPORT
BATCH_FILE
ADMIN_IMPORT
```

Le statut de confiance doit dépendre de la source.

## 19. Import de document

Formats possibles :

- PDF ;
- image ;
- CSV entreprise ;
- fichier structuré partenaire.

L’OCR ou l’IA peut aider à pré-remplir, mais l’utilisateur doit pouvoir confirmer les champs lorsque la source n’est pas vérifiée.

Le document original doit suivre les politiques de rétention Mansa.

## 20. Déduplication

Clés possibles :

```text
providerId
externalBillReference
accountReference
billingPeriod
amountDue
issueDate
```

La déduplication ne doit pas reposer sur un seul champ si celui-ci n’est pas garanti unique.

## 21. Paiement partiel

Disponible uniquement si la capability fournisseur l’autorise.

Règles possibles :

```text
minPartialAmount
maxPartialAmount
minimumRemainingBalance
maxPartialPaymentCount
```

Mansa doit recalculer `amountRemaining` après confirmation.

## 22. Surpaiement

Par défaut interdit sauf si le fournisseur l’accepte explicitement.

Un dépassement ne doit jamais être envoyé silencieusement.

## 23. Moyen de paiement

Les rails autorisés peuvent inclure :

```text
MANSA_WALLET
BANK_ACCOUNT
CARD_TOKEN
MOBILE_MONEY
PARTNER_BALANCE
BUSINESS_ACCOUNT
OTHER_SUPPORTED_RAIL
```

La disponibilité dépend du pays, du fournisseur, du partenaire, du canal et du contrat actif.

## 24. Payment Intent

Une facture à payer crée un `BillPaymentIntent` avant l’exécution.

Champs :

```text
paymentIntentId
billId
payerId
amount
currency
paymentMethodType
pricingQuoteId
feeSnapshotId
status
expiresAt
idempotencyKey
```

## 25. Statuts de paiement

```text
CREATED
REQUIRES_ACTION
PROCESSING
PROVIDER_PENDING
SUCCEEDED_PENDING_ALLOCATION
SUCCEEDED
FAILED
CANCELLED
REVERSED
REFUND_PENDING
REFUNDED
PARTIALLY_REFUNDED
```

## 26. Double débit et idempotence

Chaque initiation doit avoir une clé idempotente stable. Les retries réseau ne doivent jamais créer un second paiement pour la même intention.

Le backend doit gérer :

- timeout après débit mais avant réponse ;
- webhook reçu avant réponse API ;
- retry client ;
- retry serveur ;
- duplication fournisseur ;
- duplication webhook.

## 27. Confirmation fournisseur

Après réussite du rail de paiement, la facture peut rester :

`PAID_PENDING_PROVIDER_CONFIRMATION`.

La confirmation peut être :

```text
SYNCHRONOUS_API
ASYNC_WEBHOOK
POLLING
BATCH_RECONCILIATION
MANUAL_RECONCILIATION
```

## 28. Rapprochement

`BillReconciliation` compare au minimum :

- facture Mansa ;
- paiement Mansa ;
- référence rail ;
- référence fournisseur ;
- montant ;
- devise ;
- date ;
- état final.

Statuts :

```text
MATCHED
PARTIAL_MATCH
MISSING_PROVIDER_CONFIRMATION
MISSING_PAYMENT
AMOUNT_MISMATCH
DUPLICATE
MANUAL_REVIEW
RESOLVED
```

## 29. Reçu

Un reçu Mansa doit distinguer :

- preuve de paiement Mansa ;
- confirmation fournisseur ;
- référence fournisseur ;
- statut final.

Champs :

```text
receiptId
billId
paymentId
payerId
providerId
amount
fees
taxes
totalDebited
currency
paidAt
providerConfirmationStatus
providerReference
```

## 30. Paiement groupé

`BillBatch` contient plusieurs `BillBatchItem`.

Statuts batch :

```text
DRAFT
READY
PROCESSING
PARTIALLY_SUCCEEDED
SUCCEEDED
FAILED
CANCELLED
```

Chaque item garde son propre état, tarif et rapprochement.

## 31. Factures récurrentes

Le module peut reconnaître un pattern récurrent mais ne doit pas créer automatiquement un abonnement ou mandat sans consentement.

Exemples :

- électricité mensuelle ;
- eau ;
- Internet ;
- scolarité ;
- loyer ;
- assurance.

## 32. Rappels

Politiques possibles :

```text
ON_NEW_BILL
DAYS_BEFORE_DUE
ON_DUE_DATE
AFTER_DUE_DATE
PAYMENT_FAILED
PROVIDER_CONFIRMATION_DELAYED
```

Canaux :

```text
PUSH
SMS
EMAIL
IN_APP
JINI
```

Les canaux réellement activés dépendent du consentement et des politiques de communication.

## 33. Autopay

L’autopay doit utiliser le module de mandat de débit lorsque la source nécessite une autorisation persistante.

Règles possibles :

```text
PAY_FULL_AMOUNT
PAY_UP_TO_LIMIT
PAY_MINIMUM_AMOUNT
PAY_FIXED_AMOUNT_IF_ALLOWED
PAY_ON_DUE_DATE
PAY_N_DAYS_BEFORE_DUE
```

Le système doit vérifier :

- mandat actif ;
- plafond ;
- facture non déjà payée ;
- montant courant ;
- source valide ;
- limites ;
- risque ;
- feature flag ;
- capability fournisseur.

## 34. Planification

`BillSchedule` permet un paiement futur ponctuel.

Champs :

```text
scheduleId
billId
payerId
executeAt
sourceType
sourceId
status
createdAt
```

Statuts :

```text
SCHEDULED
PROCESSING
SUCCEEDED
FAILED
CANCELLED
EXPIRED
```

## 35. Frais et commissions — exigence transversale

Tous les frais doivent être résolus par le **Pricing & Commission Engine** central et administrables sans modification de code.

Le module doit supporter, selon configuration :

- frais fixes ;
- pourcentage ;
- fixe + pourcentage ;
- minimum ;
- maximum ;
- paliers ;
- gratuité ;
- nombre d’opérations gratuites ;
- promotion temporaire ;
- prix par pays ;
- prix par devise ;
- prix par canal ;
- prix par fournisseur ;
- prix par catégorie ;
- prix par type d’utilisateur ;
- prix par segment ;
- prix par volume ;
- commission Mansa ;
- commission agent ;
- commission commerçant ;
- commission partenaire ;
- commission agrégateur ;
- commission apporteur ;
- taxes séparées ;
- date de début ;
- date de fin.

## 36. Snapshot tarifaire

Avant paiement, le moteur produit un devis :

```text
pricingQuoteId
baseAmount
mansaFee
agentCommission
merchantCommission
partnerCommission
aggregatorCommission
referrerCommission
taxAmount
otherConfiguredCost
totalFees
totalDebited
currency
pricingRuleVersion
validUntil
```

Après exécution, un `BillFeeSnapshot` immuable est lié au paiement.

Une modification tarifaire ultérieure ne modifie jamais l’historique.

## 37. Simulation tarifaire admin

Avant publication :

```text
MODIFIER
→ SIMULER
→ COMPARER_ANCIEN_NOUVEAU
→ VOIR_IMPACT_PAR_SEGMENT
→ APPROUVER_SI_SENSIBLE
→ PROGRAMMER
→ PUBLIER
```

Toutes les modifications sensibles sont auditées.

## 38. RBAC

Rôles possibles :

```text
BILL_USER
BILL_BUSINESS_USER
BILL_APPROVER
BILL_ACCOUNTANT
BILL_SUPPORT_VIEWER
BILL_SUPPORT_OPERATOR
BILL_PROVIDER_OPERATOR
BILL_RECONCILIATION_OPERATOR
BILL_RISK_OPERATOR
BILL_ADMIN
BILL_SUPER_ADMIN
```

## 39. ABAC

Les décisions doivent aussi considérer :

- tenant ;
- pays ;
- fournisseur ;
- montant ;
- devise ;
- type de facture ;
- niveau KYC/KYB ;
- rôle entreprise ;
- centre de coûts ;
- device trust ;
- score de risque ;
- canal ;
- heure ;
- statut utilisateur ;
- statut fournisseur.

## 40. Approbations entreprise

Exemples :

```text
amount <= 100000 XOF → approbation simple
amount > 100000 XOF → manager
amount > 1000000 XOF → double validation
```

Ces seuils sont des exemples configurables, pas des règles codées en dur.

## 41. Feature flags

```text
bills.enabled
bills.manualImport.enabled
bills.ocrAssist.enabled
bills.providerFetch.enabled
bills.partialPayment.enabled
bills.batchPayment.enabled
bills.scheduledPayment.enabled
bills.autopay.enabled
bills.refunds.enabled
bills.disputes.enabled
bills.businessApproval.enabled
bills.jini.enabled
```

Les flags peuvent être surchargés par pays, tenant, fournisseur ou segment.

## 42. Multi-pays

Chaque pays peut définir :

- catégories disponibles ;
- fournisseurs activés ;
- devises ;
- limites ;
- moyens de paiement ;
- exigences KYC/KYB ;
- taxes ;
- règles de conservation ;
- politiques de remboursement ;
- parcours d’authentification ;
- mécanismes de notification.

Aucune règle réglementaire ne doit être supposée universelle.

## 43. Multi-devise

Une facture garde sa devise d’origine.

Si le paiement utilise une autre devise et qu’un service de change est autorisé :

1. obtenir un quote FX ;
2. afficher taux, marge et frais ;
3. verrouiller temporairement le quote ;
4. confirmer ;
5. conserver le snapshot FX.

Le module ne doit jamais convertir silencieusement.

## 44. API — endpoints recommandés

```text
GET    /v1/bill-providers
GET    /v1/bill-providers/:id
POST   /v1/bill-provider-links
GET    /v1/bill-provider-links
DELETE /v1/bill-provider-links/:id
POST   /v1/bills/sync
POST   /v1/bills/import
GET    /v1/bills
GET    /v1/bills/:id
POST   /v1/bills/:id/refresh
POST   /v1/bills/:id/quote
POST   /v1/bills/:id/pay
POST   /v1/bills/:id/schedule
POST   /v1/bills/:id/autopay
DELETE /v1/bills/:id/autopay
POST   /v1/bill-batches
POST   /v1/bill-batches/:id/execute
GET    /v1/bill-payments/:id
GET    /v1/bill-payments/:id/receipt
POST   /v1/bill-payments/:id/refund
POST   /v1/bills/:id/disputes
```

## 45. API fournisseur

Exemples abstraits :

```text
lookupCustomer()
fetchBills()
fetchBill()
validateAmount()
createPayment()
getPaymentStatus()
confirmPosting()
cancelPayment()
refundPayment()
fetchReceipt()
```

Chaque adaptateur transforme la réponse externe en contrats Mansa normalisés.

## 46. Webhooks entrants

Événements possibles :

```text
provider.bill.created
provider.bill.updated
provider.bill.cancelled
provider.payment.accepted
provider.payment.posted
provider.payment.failed
provider.refund.completed
```

Ils doivent être :

- authentifiés ;
- signés si le partenaire le supporte ;
- dédupliqués ;
- horodatés ;
- journalisés ;
- traités idempotemment.

## 47. Webhooks sortants

```text
bill.created
bill.updated
bill.overdue
bill.payment.processing
bill.payment.succeeded
bill.payment.failed
bill.provider_confirmed
bill.refund.completed
bill.dispute.opened
```

Les tentatives de delivery doivent être rejouables avec backoff contrôlé.

## 48. Sécurité

Le module doit appliquer :

- TLS ;
- chiffrement au repos ;
- secrets dans vault/KMS ;
- tokenisation des moyens de paiement ;
- signatures webhook ;
- rotation des clés ;
- scopes API ;
- rate limits ;
- idempotency keys ;
- contrôle d’accès fin ;
- protection contre mass assignment ;
- validation stricte des montants et devises ;
- protection CSRF lorsque pertinente ;
- journalisation sécurisée ;
- masquage des références sensibles.

## 49. Anti-fraude

Signaux possibles :

- nouvel appareil ;
- montant inhabituel ;
- paiement répété ;
- référence fournisseur récemment ajoutée ;
- trop de tentatives ;
- échecs consécutifs ;
- incohérence géographique ;
- plusieurs comptes payant la même référence de façon anormale ;
- facture importée non vérifiée ;
- divergence montant fournisseur/utilisateur ;
- fournisseur ou intégration dégradée.

Actions :

```text
ALLOW
ALLOW_WITH_MONITORING
REQUIRE_STEP_UP
HOLD
MANUAL_REVIEW
BLOCK
```

## 50. Audit

Événements obligatoires :

- création ou suppression d’un lien fournisseur ;
- import facture ;
- modification manuelle ;
- paiement ;
- changement d’état ;
- remboursement ;
- litige ;
- action support ;
- intervention de rapprochement ;
- changement configuration fournisseur ;
- changement pricing ;
- changement feature flag.

L’audit doit conserver l’acteur, la raison, l’horodatage et les identifiants techniques utiles sans stocker de secrets.

## 51. Données minimisées

Ne stocker que les données nécessaires.

Exemples à masquer ou limiter :

- numéro de compteur ;
- référence contrat ;
- adresse de service ;
- nom du titulaire ;
- identifiants externes ;
- documents importés.

La durée de conservation doit suivre les règles générales de gouvernance des données Mansa et les obligations applicables.

## 52. Export et suppression

Lorsque permis :

- export des factures ;
- export des reçus ;
- export entreprise CSV/JSON ;
- suppression de liens fournisseurs ;
- purge des documents temporaires ;
- anonymisation selon politique.

Les écritures légalement ou comptablement nécessaires ne doivent pas être supprimées de manière incohérente.

## 53. Réseau faible

L’application peut mettre en cache de manière sécurisée :

- liste récente de factures ;
- fournisseur ;
- date d’échéance ;
- statut local ;
- reçu déjà émis.

Mais un paiement ne doit pas être marquéé `SUCCEEDED` hors ligne sans confirmation du backend.

## 54. Mode hors ligne

Le mode hors ligne peut autoriser :

- consultation de données déjà synchronisées ;
- préparation d’une intention ;
- ajout d’un rappel local ;
- scan ou import local temporaire.

Il ne doit pas autoriser :

- double débit ;
- création d’un paiement financier définitif ;
- confirmation fournisseur fictive ;
- modification tarifaire admin ;
- contournement du risque.

## 55. Résilience

Le système doit supporter :

- timeout fournisseur ;
- fournisseur indisponible ;
- paiement réussi mais callback perdu ;
- callback dupliqué ;
- ordre des événements inversé ;
- reprise après incident ;
- file de retry ;
- dead-letter queue ;
- circuit breaker ;
- backoff exponentiel ;
- polling de récupération ;
- rapprochement différé.

## 56. Observabilité

Métriques minimales :

```text
bill_sync_success_rate
bill_sync_latency
bill_lookup_success_rate
payment_success_rate
provider_confirmation_latency
reconciliation_mismatch_rate
refund_rate
dispute_rate
duplicate_prevented_count
pricing_quote_error_rate
webhook_delivery_success_rate
```

Logs structurés avec `correlationId`, `billId`, `paymentId`, `providerId`, sans secret.

## 57. Administration fournisseurs

Le Super Admin doit pouvoir :

- activer/désactiver un fournisseur ;
- limiter à certains pays ;
- configurer capabilities ;
- choisir adaptateur ;
- définir environnement sandbox/prod ;
- configurer délais ;
- définir politique de polling ;
- définir politiques de refund ;
- définir plafonds ;
- configurer feature flags ;
- rattacher règles pricing ;
- voir incidents et taux d’erreur ;
- suspendre un canal ;
- forcer une réconciliation contrôlée ;
- auditer toutes les modifications.

## 58. Jini

Jini peut, selon permissions :

- expliquer une facture ;
- retrouver une facture ;
- rappeler une échéance ;
- comparer mois précédent/mois courant ;
- aider à identifier un fournisseur ;
- préparer un paiement ;
- expliquer les frais ;
- guider vers un litige.

Jini ne doit pas exécuter silencieusement un paiement sensible sans le workflow d’autorisation requis.

## 59. Notifications

Exemples :

- nouvelle facture ;
- échéance proche ;
- facture en retard ;
- paiement programmé demain ;
- paiement réussi ;
- paiement échoué ;
- fournisseur en attente ;
- confirmation fournisseur reçue ;
- remboursement ;
- litige mis à jour.

## 60. Entreprise — centres de coûts

Une facture B2B peut être rattachée à :

```text
organizationId
businessUnitId
costCenterId
projectId
budgetId
ownerEmployeeId
```

Ces dimensions ne doivent pas polluer le modèle particulier ; elles peuvent être optionnelles.

## 61. Entreprise — workflow d’approbation

```text
RECEIVED
→ CLASSIFIED
→ ASSIGNED
→ PENDING_APPROVAL
→ APPROVED
→ SCHEDULED_OR_PAID
→ RECONCILED
```

Les règles peuvent dépendre du montant, fournisseur, budget, centre de coûts ou rôle.

## 62. Export comptable

Formats possibles :

- CSV ;
- JSON ;
- PDF reçu ;
- connecteur ERP ;
- webhook comptable.

Les mappings comptables sont configurables par organisation.

## 63. Litiges

`BillDispute` peut porter sur :

```text
WRONG_AMOUNT
UNKNOWN_BILL
DUPLICATE_BILL
PAID_BUT_NOT_POSTED
SERVICE_DISPUTE
REFUND_NOT_RECEIVED
OTHER
```

Mansa doit distinguer litige sur le **service/facture** et litige sur le **paiement**.

## 64. Remboursements

Un remboursement dépend :

- du fournisseur ;
- du rail ;
- du statut de paiement ;
- du contrat ;
- du pays ;
- de la cause ;
- du settlement.

Statuts :

```text
REQUESTED
UNDER_REVIEW
PROVIDER_PENDING
PROCESSING
COMPLETED
PARTIALLY_COMPLETED
REJECTED
FAILED
```

## 65. Settlement

Selon le modèle, le paiement peut être :

- transféré directement au fournisseur par le rail ;
- encaissé via partenaire ;
- agrégé puis réglé ;
- compensé par batch.

Le domaine facture doit recevoir les références de settlement mais ne remplace pas le moteur financier dédié.

## 66. Sandbox

La sandbox doit proposer :

- faux fournisseurs ;
- lookup client ;
- facture ouverte ;
- facture déjà payée ;
- facture partielle ;
- provider timeout ;
- paiement async ;
- webhook tardif ;
- duplicate webhook ;
- remboursement ;
- mismatch de rapprochement.

Aucun secret réel dans la sandbox publique.

## 67. Tests unitaires

Couvrir au minimum :

- transitions d’état ;
- montant restant ;
- paiement partiel ;
- paiement total ;
- surpaiement interdit ;
- déduplication ;
- idempotence ;
- pricing snapshot ;
- permissions ;
- mapping fournisseur ;
- rappel ;
- autopay ;
- remboursement ;
- batch.

## 68. Tests d’intégration

Scénarios :

- fournisseur API sync ;
- fournisseur async ;
- timeout ;
- retry ;
- webhook ;
- paiement + confirmation ;
- paiement + absence de confirmation ;
- réconciliation ;
- mandat/autopay ;
- moteur pricing ;
- ledger ;
- notifications ;
- audit.

## 69. Tests E2E

Parcours complets :

1. ajouter fournisseur → récupérer facture → payer → reçu ;
2. importer facture manuellement → payer ;
3. facture partielle → deuxième paiement → payé ;
4. paiement groupé avec succès partiel ;
5. facture programmée ;
6. autopay avec mandat valide ;
7. échec rail puis retry idempotent ;
8. paiement réussi mais confirmation fournisseur retardée ;
9. remboursement ;
10. entreprise avec double approbation.

## 70. Tests sécurité

- IDOR/BOLA ;
- escalade de privilège ;
- rejeu webhook ;
- signature invalide ;
- injection ;
- modification montant côté client ;
- contournement feature flag ;
- contournement approbation ;
- brute force référence fournisseur ;
- fuite PII ;
- double paiement par race condition.

## 71. Tests de performance

Tester :

- sync massif ;
- pics fin de mois ;
- paiements simultanés ;
- webhooks en rafale ;
- batch entreprise ;
- génération de reçus ;
- réconciliation nocturne ;
- quote pricing.

## 72. SLO indicatifs à valider

Hypothèse à valider :

- API interne lecture facture : p95 < 500 ms hors dépendance fournisseur ;
- création d’intention : p95 < 800 ms hors rail ;
- disponibilité domaine : objectif >= 99,9 % ;
- perte de transaction financière : 0 tolérée ;
- duplication financière créée par Mansa : 0 tolérée.

Les valeurs finales doivent être validées selon infrastructure et contrats.

## 73. Ordre de développement recommandé

### Phase 1 — Socle

- modèle BillProvider ;
- modèle Bill ;
- statuts ;
- liens client-fournisseur ;
- adaptateur mock ;
- import manuel ;
- lecture API ;
- audit.

### Phase 2 — Paiement

- Payment Intent ;
- intégration moteur paiement ;
- pricing ;
- reçu ;
- idempotence ;
- confirmation fournisseur.

### Phase 3 — Fournisseurs

- framework adaptateurs ;
- webhooks ;
- synchronisation ;
- capacités ;
- rapprochement.

### Phase 4 — Avancé

- paiement partiel ;
- batch ;
- programmation ;
- rappels ;
- autopay + mandats ;
- remboursements ;
- litiges.

### Phase 5 — B2B et scale

- approbations entreprise ;
- centres de coûts ;
- export comptable ;
- haute volumétrie ;
- supervision avancée ;
- sandbox partenaire.

## 74. Critères d’acceptation fonctionnels

Le module est considéré fonctionnel lorsque :

1. un fournisseur peut être configuré sans modification du domaine central ;
2. une facture peut être importée ou récupérée via adaptateur ;
3. une facture possède un état indépendant du paiement ;
4. un utilisateur peut payer une facture avec un moyen autorisé ;
5. un retry ne produit pas de double débit ;
6. les frais sont calculés depuis le Pricing & Commission Engine ;
7. le tarif appliqué est snapshoté ;
8. un reçu est généré ;
9. une confirmation fournisseur asynchrone peut être traitée ;
10. le rapprochement identifie les écarts ;
11. l’audit capture les actions sensibles ;
12. RBAC/ABAC empêchent l’accès non autorisé ;
13. les données sensibles sont masquées ;
14. le multi-pays et la multi-devise sont configurables ;
15. les capacités non supportées sont masquées ou désactivées proprement.

## 75. Critères d’acceptation pricing

Le Super Admin autorisé doit pouvoir, sans changement de code :

- créer une règle ;
- choisir pays, devise, canal, fournisseur et segment ;
- définir fixe, %, fixe + %, min/max et paliers ;
- définir gratuité ou promotion ;
- répartir Mansa/agent/commerçant/partenaire/agrégateur/apporteur ;
- isoler les taxes ;
- définir dates d’effet ;
- simuler ;
- soumettre à approbation ;
- publier ;
- désactiver ;
- consulter l’historique ;
- retrouver la version appliquée à chaque paiement.

## 76. Critères d’acceptation résilience

- timeout fournisseur sans double débit ;
- reprise d’un webhook dupliqué ;
- récupération d’un paiement au statut inconnu ;
- rapprochement après indisponibilité ;
- traitement des files de retry ;
- aucune corruption d’état en cas d’événements inversés ;
- journal d’incident exploitable.

## 77. Dépendances internes Mansa

Le module s’intègre avec :

- Identity/KYC/KYB ;
- Organizations ;
- Wallets ;
- Payments ;
- Ledger ;
- Cards ;
- Mobile Money adapters ;
- Bank adapters ;
- Debit Mandates ;
- Pricing & Commission Engine ;
- Limits ;
- Fraud/Risk ;
- Notifications ;
- Audit ;
- Data Governance ;
- Jini ;
- Reporting/BI ;
- Support ;
- FX lorsqu’activé.

## 78. Dépendances externes

Toute dépendance externe doit rester abstraite :

- fournisseurs de services ;
- agrégateurs de factures ;
- banques ;
- opérateurs Mobile Money ;
- acquéreurs carte ;
- services publics ;
- écoles ;
- administrations ;
- ERP ;
- prestataires de messagerie.

Aucune intégration ne doit être présentée comme disponible avant contrat, certification et configuration réelle.

## 79. Points à valider avant production

- fournisseurs réellement disponibles par pays ;
- contrats d’intégration ;
- modèle de settlement ;
- règles fiscales ;
- délais de confirmation ;
- politiques de remboursement ;
- format des reçus ;
- exigences légales de conservation ;
- obligations d’authentification ;
- plafonds ;
- support des paiements partiels ;
- support des mandats ;
- SLA partenaires ;
- responsabilités en cas de litige.

## 80. Résultat attendu

Le module **Factures avancées** doit devenir la couche Mansa commune pour découvrir, recevoir, importer, payer, programmer, rapprocher et archiver des factures provenant de nombreux fournisseurs, sans dépendre d’un fournisseur unique ni dupliquer les moteurs financiers existants.

Il doit offrir une expérience simple côté utilisateur tout en conservant une architecture professionnelle : adaptateurs partenaires, états explicites, idempotence, audit, sécurité, fraude, multi-pays, multi-devise, résilience, administration et tarification versionnée.

Le **Pricing & Commission Engine** reste la seule source de vérité des frais configurables, et chaque paiement de facture conserve pour toujours le snapshot exact des frais, commissions et taxes qui lui ont été appliqués.