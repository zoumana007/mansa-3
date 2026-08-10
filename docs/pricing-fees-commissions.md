# Cahier des charges — Tarification, frais, commissions et partage de revenus

## 1. Objet

Ce document définit le moteur Mansa de tarification, frais, commissions, remises, subventions, taxes, partage de revenus et règles commerciales applicables aux paiements et services.

Il complète les domaines déjà documentés de paiements, wallets, ledger, agents, commerce, acquisition, trésorerie, règlement, remboursements, secteur public, péages, change, abonnements et facturation. Il ne remplace aucun de ces domaines.

L’objectif est de disposer d’un moteur central, versionné, auditable, multi-pays et multi-produit capable de calculer exactement qui paie quoi, qui reçoit quoi et pourquoi, sans logique tarifaire dupliquée dans les applications clientes.

## 2. Principes directeurs

1. toute tarification doit être calculée côté serveur ;
2. aucune application mobile, borne, TPE ou interface web ne doit être source de vérité du montant final ;
3. les règles tarifaires doivent être versionnées et historisées ;
4. une transaction doit conserver la version de règle réellement appliquée ;
5. les montants affichés avant confirmation doivent correspondre au calcul serveur applicable à cet instant ;
6. les frais, commissions, taxes, remises et subventions doivent être représentés séparément ;
7. le moteur doit supporter des tarifs fixes, proportionnels, mixtes, par paliers et plafonnés ;
8. les règles doivent pouvoir varier par pays, produit, canal, organisation, segment, moyen de paiement, devise et période ;
9. les changements sensibles doivent être auditables et éventuellement soumis à double validation ;
10. le moteur ne doit jamais créer de valeur hors ledger ;
11. toute modification rétroactive d’une règle active doit être interdite ; une nouvelle version doit être créée ;
12. les remboursements, reversals et chargebacks doivent retraiter les frais et commissions selon des politiques explicites ;
13. les règles commerciales ne doivent pas contourner les contraintes réglementaires, contractuelles ou de réseau ;
14. la précision monétaire et les règles d’arrondi doivent être explicites par devise.

## 3. Périmètre

Le moteur couvre notamment :

- frais client ;
- frais commerçant ;
- frais agent ;
- commissions agent ;
- commissions distributeur ;
- commissions apporteur ;
- frais acquéreur ;
- frais opérateur Mobile Money ;
- frais carte ;
- frais réseau ;
- frais de retrait ;
- frais de dépôt ;
- frais de transfert ;
- frais de paiement facture ;
- frais de change ;
- frais de service ;
- frais d’abonnement ;
- frais de livraison ;
- commissions marketplace ;
- partage de revenus ;
- remises promotionnelles ;
- subventions État/entreprise ;
- gratuités conditionnelles ;
- taxes et prélèvements ;
- tarification péage ;
- tarification transport ;
- prix plancher/plafond ;
- minimum et maximum de frais.

## 4. Entités recommandées

```text
PricingPlan
PricingRule
PricingRuleVersion
PricingCondition
PricingComponent
FeeDefinition
CommissionDefinition
RevenueShareDefinition
DiscountDefinition
SubsidyDefinition
TaxDefinition
RoundingPolicy
PricingQuote
PricingQuoteLine
AppliedPricingRule
PricingApproval
PricingChangeRequest
PricingExperiment
PricingException
PricingAuditEvent
```

Chaque entité doit être reliée au pays, à la devise, au produit, au canal, à l’organisation et à l’environnement lorsque pertinent.

## 5. Hiérarchie de résolution

Le moteur doit résoudre les règles selon une hiérarchie déterministe.

Exemple :

```text
TRANSACTION_EXCEPTION
-> CONTRACT_SPECIFIC
-> ORGANIZATION
-> PRODUCT
-> CHANNEL
-> COUNTRY
-> GLOBAL_DEFAULT
```

Une règle plus spécifique peut remplacer une règle plus générale uniquement lorsque le champ concerné autorise l’override.

L’ordre de priorité doit être documenté et stable.

## 6. Dimensions de ciblage

Une règle peut dépendre de :

```text
countryCode
currency
productCode
serviceCode
channel
paymentMethod
paymentNetwork
acquirerId
providerId
merchantId
merchantCategory
organizationId
agentId
agentNetworkId
customerSegment
customerTier
kycLevel
transactionType
amountRange
sourceCountry
destinationCountry
sourceCurrency
destinationCurrency
dayOfWeek
timeWindow
campaignId
contractId
```

Les conditions doivent être explicites et testables.

## 7. Composants d’un prix

Un calcul peut produire plusieurs lignes :

```text
BASE_AMOUNT
CUSTOMER_FEE
MERCHANT_FEE
AGENT_FEE
AGENT_COMMISSION
DISTRIBUTOR_COMMISSION
MANSA_REVENUE
PARTNER_REVENUE
ACQUIRER_COST
NETWORK_COST
PROVIDER_COST
FX_MARGIN
TAX
DISCOUNT
SUBSIDY
ROUNDING_ADJUSTMENT
```

Chaque ligne conserve sa formule, son bénéficiaire, son payeur et sa version de règle.

## 8. Frais fixes

Exemple :

```text
fee = 250 XOF
```

Le moteur doit pouvoir appliquer un montant fixe indépendamment du principal, sous réserve de minimum/maximum réglementaire ou contractuel.

## 9. Frais proportionnels

Exemple :

```text
fee = amount * 1%
```

Le pourcentage doit être stocké avec précision suffisante et jamais approximé par l’interface cliente.

## 10. Frais mixtes

Exemple :

```text
fee = 100 XOF + 0.5% * amount
```

Le moteur doit définir l’ordre entre composantes fixes, variables, minimum, maximum et taxes.

## 11. Minimum et maximum

Exemple :

```text
rawFee = amount * 1%
fee = min(max(rawFee, 100 XOF), 2 500 XOF)
```

Le résultat doit indiquer si un plancher ou plafond a été appliqué.

## 12. Tarification par paliers

Le moteur supporte :

```text
0 - 5 000 XOF      -> 50 XOF
5 001 - 25 000     -> 100 XOF
25 001 - 100 000   -> 0.75%
> 100 000          -> 0.5% avec plafond
```

Les limites de paliers ne doivent ni se chevaucher ni laisser de trou sauf politique explicite.

## 13. Paliers progressifs

Le moteur peut distinguer :

- palier unique selon montant total ;
- tarification progressive par tranche.

La règle doit préciser le mode afin d’éviter toute ambiguïté.

## 14. Gratuité

Une opération peut être gratuite pour le client tout en générant des coûts internes.

Exemples :

```text
CUSTOMER_FEE = 0
MERCHANT_FEE = 1%
```

ou :

```text
CUSTOMER_FEE = 0
MERCHANT_FEE = 0
SUBSIDY_PAYER = STATE
```

La gratuité visible ne doit jamais masquer le coût économique réel.

## 15. Qui paie les frais

Modes recommandés :

```text
SENDER_PAYS
RECEIVER_PAYS
MERCHANT_PAYS
PLATFORM_PAYS
STATE_PAYS
SHARED
INCLUDED_IN_PRICE
```

Pour un partage, chaque quote-part doit être explicite.

## 16. Frais inclus ou ajoutés

Le moteur distingue :

```text
ADD_ON_TOP
DEDUCT_FROM_PRINCIPAL
INCLUDED_IN_DISPLAYED_PRICE
```

Exemple transfert :

- montant envoyé : 10 000 XOF ;
- frais : 100 XOF ;
- total débité si `ADD_ON_TOP` : 10 100 XOF ;
- bénéficiaire reçoit : 10 000 XOF.

## 17. Commission agent

La commission agent doit être séparée du frais client.

Exemple :

```text
customerFee = 1 000 XOF
agentCommission = 600 XOF
MansaGrossRevenue = 400 XOF
```

Le moteur ne doit jamais supposer que la totalité du frais appartient à Mansa.

## 18. Commission variable agent

La commission peut dépendre de :

- type d’opération ;
- montant ;
- volume mensuel ;
- zone géographique ;
- performance ;
- niveau d’agent ;
- campagne ;
- qualité opérationnelle ;
- risque ;
- contrat.

Toute logique de performance doit éviter les incitations incompatibles avec la conformité ou la protection client.

## 19. Commission hiérarchique

Pour un réseau :

```text
Agent
-> Super-agent
-> Distributeur
-> Mansa
```

Une transaction peut générer plusieurs commissions.

Exemple :

```text
agent = 500 XOF
superAgent = 100 XOF
distributor = 50 XOF
Mansa = remainder
```

Chaque bénéficiaire reçoit une écriture séparée.

## 20. Partage de revenus

Un produit peut utiliser :

```text
PERCENTAGE_OF_FEE
PERCENTAGE_OF_GROSS_REVENUE
FIXED_PER_TRANSACTION
TIERED_SHARE
NET_AFTER_COSTS
```

`NET_AFTER_COSTS` doit définir précisément quels coûts sont déductibles.

## 21. Coûts partenaires

Le moteur doit pouvoir distinguer revenu et coût :

```text
customerFee
merchantFee
providerCost
networkCost
acquirerCost
agentCommission
MansaNetRevenue
```

Le reporting doit permettre une marge unitaire réelle par produit.

## 22. Tarification commerçant

Le commerçant peut avoir :

- MDR proportionnel ;
- forfait fixe ;
- abonnement + taux réduit ;
- tarification par volume ;
- prix négocié ;
- tarification par secteur ;
- coût différent selon canal ;
- frais de règlement accéléré.

Un contrat commerçant doit être versionné avec date d’effet.

## 23. Paiement carte

Les frais carte peuvent dépendre de :

- acquéreur ;
- réseau ;
- type de carte lorsque cette information est contractuellement disponible ;
- pays émission/acquisition ;
- canal présent/non présent ;
- devise ;
- segment commerçant ;
- contrat.

Mansa doit utiliser uniquement les informations légalement et contractuellement disponibles.

## 24. Multi-réseaux carte

Le terminal doit accepter les réseaux activés par l’acquéreur, notamment Visa et Mastercard lorsque contractuellement disponibles.

Le moteur de prix ne doit pas promettre l’acceptation de toutes les cartes du monde.

Une règle peut distinguer le coût par réseau lorsque le contrat le permet.

## 25. Mobile Money

Le moteur doit gérer séparément :

- coût opérateur ;
- frais Mansa ;
- éventuelle commission agent ;
- remise ou subvention ;
- taxe applicable.

Les capacités et coûts peuvent varier par opérateur et pays.

## 26. Wallet Mansa

Une transaction interne wallet peut avoir un coût économique différent d’un rail externe.

Le moteur peut appliquer :

```text
FREE
FIXED_FEE
PERCENTAGE_FEE
CONTRACT_RATE
```

Toute gratuité doit rester configurable.

## 27. Dépôt espèces

Le cash-in peut produire :

- frais client ;
- commission agent ;
- commission distributeur ;
- coût de gestion espèces ;
- coût logistique estimé ;
- revenu Mansa.

Le moteur doit permettre un modèle où le client ne paie rien mais l’agent est rémunéré par Mansa ou un partenaire.

## 28. Retrait espèces

Le cash-out doit permettre une tarification par :

- montant ;
- canal agent/ATM ;
- réseau ;
- zone ;
- niveau client ;
- disponibilité liquidité ;
- contrat.

Les prix ne doivent pas varier de manière opaque au détriment du client.

## 29. ATM

Les frais ATM distinguent :

- surcharge locale ;
- coût opérateur ATM ;
- coût réseau ;
- frais Mansa ;
- éventuels frais banque/émetteur externes non contrôlés par Mansa.

L’interface doit préciser les frais contrôlés par Mansa et éviter d’affirmer qu’aucun autre frais externe ne peut exister.

## 30. Virements et transferts P2P

Le moteur peut appliquer :

```text
INTERNAL_FREE
FIXED_TRANSFER_FEE
PERCENTAGE_TRANSFER_FEE
DESTINATION_BASED
RAIL_BASED
```

Le bénéficiaire doit recevoir le montant annoncé sauf politique clairement affichée avant confirmation.

## 31. Transfert international et change

Le coût total doit pouvoir séparer :

```text
transferFee
providerFee
fxRateReference
fxMargin
recipientAmount
```

Le client doit voir le montant débité et le montant estimé/reçu selon les contraintes du rail.

## 32. Marge de change

La marge FX doit être une composante explicite de pricing interne.

Le moteur conserve :

```text
referenceRate
appliedRate
spread
rateSource
rateTimestamp
pricingRuleVersion
```

Aucune interface ne recalcule le taux indépendamment.

## 33. Paiement de factures

Les modèles possibles :

- frais payés par client ;
- commission payée par fournisseur de service ;
- coût absorbé par Mansa ;
- partage fournisseur/Mansa/agent ;
- gratuité subventionnée.

Le modèle doit être configurable par biller.

## 34. Airtime et bundles

Le revenu peut venir d’une remise grossiste ou d’une commission opérateur plutôt que d’un frais visible client.

Le moteur doit distinguer :

```text
retailPrice
wholesaleCost
discount
commission
MansaMargin
```

## 35. Marketplace et commerce

Une commande peut générer :

- commission marketplace ;
- frais paiement ;
- frais livraison ;
- commission vendeur ;
- commission affilié ;
- taxe ;
- coupon ;
- subvention promotionnelle.

Chaque ligne doit rester traçable.

## 36. Abonnements

Le pricing supporte :

- mensualité fixe ;
- annuel ;
- essai ;
- tarif par utilisateur ;
- tarif par terminal ;
- tarif par volume ;
- paliers ;
- modules additionnels ;
- dépassement d’usage.

Les renouvellements utilisent la version tarifaire contractuellement applicable.

## 37. Tarification entreprise

Une entreprise peut avoir un contrat personnalisé :

```text
contractId
pricingPlanId
validFrom
validUntil
billingCycle
minimumCommitment
volumeTier
customFeeOverrides
```

Une modification contractuelle ne doit pas altérer les transactions historiques.

## 38. Tarification secteur public

Pour taxes, amendes, scolarité, bourses, documents administratifs et autres services État, le moteur doit permettre :

```text
CITIZEN_PAYS
STATE_PAYS
AGENCY_PAYS
SHARED
NO_FEE
```

La règle doit pouvoir être définie par service et administration.

## 39. Subvention État

Exemple :

```text
serviceAmount = 10 000 XOF
citizenFee = 0
processingCost = 200 XOF
subsidyPayer = STATE
```

La subvention doit produire une créance, une écriture ou une ligne de règlement identifiable selon le modèle financier.

## 40. Péages — décisions de référence obligatoires

Le domaine péage conserve simultanément :

- solution A : péage automatique classique avec barrière ;
- solution B : télépéage RFID avec barrière ;
- évolution future optionnelle vers free-flow sans barrière sans remplacer les deux solutions initiales.

Le péage classique peut accepter selon activation :

- billets FCFA ;
- pièces FCFA ;
- carte bancaire EMV multi-réseaux ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

Mobile Money reste activable/désactivable par l’administration au niveau national, réseau, poste ou voie, avec date d’effet et audit. Il ne doit jamais être supprimé automatiquement.

Le télépéage initial utilise des tags UHF RFID passifs associés à un véhicule et à un compte, avec lecteur/antenne, contrôleur local, relais `OPEN`, barrière et capteurs de passage.

Le système conserve un fonctionnement local/hors ligne sécurisé avec resynchronisation et absence de double débit.

Le matériel reste multi-fournisseurs derrière des adaptateurs avec relais/contact sec ou interface industrielle documentée.

Trois niveaux d’équipement sont conservés : voie automatique complète, voie semi-automatique avec gestion sécurisée des espèces et poste numérisé à faible coût.

Le déploiement doit être progressif afin que l’État ne soit pas obligé d’équiper tous les péages immédiatement.

Deux modèles commerciaux sont supportés : matériel acheté directement par l’État/concessionnaire ou matériel fourni/intégré/revendu par Mansa.

La marque blanche État/concessionnaire couvre bornes, tags, écrans, reçus et signalétique avec mention `Propulsé par Mansa` facultative.

Le contrôle anti-corruption rapproche véhicule détecté, catégorie, tarif attendu, paiement, ouverture de barrière et passage physique ; toute ouverture manuelle est auditée.

## 41. Tarification péage

Le prix de péage peut dépendre de :

```text
tollSite
tollPlaza
lane
vehicleClass
journeySegment
timeWindow
subscriptionType
tagAccount
concessionContract
publicPolicy
```

Le prix affiché et facturé doit provenir de la même version tarifaire.

## 42. Classe véhicule

Les classes tarifaires doivent être versionnées et configurables.

La modification manuelle d’une classe par un agent doit être auditée, notamment pour prévenir la minoration frauduleuse du tarif.

## 43. Télépéage

Le télépéage peut utiliser :

- prix unitaire standard ;
- remise abonné ;
- forfait mensuel ;
- quota inclus ;
- tarif flotte ;
- contrat entreprise ;
- exemption publique autorisée.

La règle appliquée doit être enregistrée avec chaque passage.

## 44. Free-flow futur

L’évolution free-flow utilise le même moteur de prix afin de conserver cohérence et historique.

Elle ne remplace pas les modes barrière existants.

## 45. Transport public

La tarification transport peut supporter :

- tarif fixe ;
- zones ;
- distance ;
- correspondance ;
- plafond journalier ;
- abonnement ;
- tarif étudiant ;
- tarif social ;
- gratuité autorisée ;
- multi-mode.

Les politiques sociales doivent être séparées du prix brut pour permettre l’audit des subventions.

## 46. Promotions

Une promotion doit définir :

```text
promotionId
validFrom
validUntil
eligibility
usageLimit
budgetLimit
discountType
discountValue
fundingSource
```

Elle ne modifie jamais la règle tarifaire permanente.

## 47. Remise fixe

Exemple :

```text
-500 XOF
```

Le montant final ne peut devenir négatif sauf produit explicitement conçu comme crédit.

## 48. Remise proportionnelle

Exemple :

```text
10% avec plafond de 2 000 XOF
```

Le plafond et l’assiette doivent être explicites.

## 49. Coupons

Les coupons doivent pouvoir être :

- usage unique ;
- multi-usage ;
- limités à un utilisateur ;
- limités à un commerçant ;
- limités à un produit ;
- limités par budget ;
- limités dans le temps.

La validation se fait côté serveur.

## 50. Financement des promotions

Le coût d’une remise peut être supporté par :

```text
MANSA
MERCHANT
PARTNER
STATE
SHARED
```

La comptabilité doit identifier la source de financement.

## 51. Taxation

Le moteur doit permettre de calculer des taxes lorsque Mansa est responsable de leur calcul ou collecte.

Chaque taxe conserve :

```text
taxCode
jurisdiction
rate
base
effectiveFrom
effectiveTo
inclusiveOrExclusive
```

Le produit ne doit pas inventer une obligation fiscale ; les règles doivent être configurées selon validation juridique/fiscale.

## 52. Taxes incluses/exclues

Modes :

```text
TAX_INCLUDED
TAX_ADDED
NOT_APPLICABLE
```

Le reçu doit présenter les informations requises par le contexte réglementaire.

## 53. Arrondis

Une politique d’arrondi est obligatoire par devise et composant.

Exemples :

```text
HALF_UP
HALF_EVEN
FLOOR
CEILING
NEAREST_CURRENCY_UNIT
```

Les montants XOF doivent respecter l’unité monétaire réellement utilisable par le canal concerné.

## 54. Ordre de calcul

L’ordre doit être déterministe.

Exemple :

```text
1. principal
2. remise
3. base taxable
4. frais
5. taxes
6. commissions
7. subventions
8. arrondi final
```

L’ordre réel doit être défini par produit et juridiction sans ambiguïté.

## 55. Quote tarifaire

Avant confirmation, le backend crée une `PricingQuote`.

Champs recommandés :

```text
quoteId
transactionType
principalAmount
currency
lines[]
totalDebit
recipientAmount
expiresAt
pricingRuleVersions[]
contextHash
```

## 56. Expiration d’une quote

Une quote doit expirer après une durée définie, particulièrement pour FX, promotions ou règles temporelles.

Après expiration, le backend recalcule le prix.

## 57. Verrouillage du prix

Pour certains parcours, une quote valide peut verrouiller le prix pendant :

- confirmation utilisateur ;
- authentification ;
- traitement court ;
- passage péage ;
- checkout.

La durée doit être limitée et auditable.

## 58. Confirmation utilisateur

Lorsqu’une confirmation est requise, elle doit afficher au minimum :

- montant principal ;
- frais payés par l’utilisateur ;
- total débité ;
- montant reçu lorsque pertinent ;
- devise ;
- information de change lorsque pertinente.

## 59. Transactions sans confirmation interactive

Certaines opérations automatiques — télépéage, abonnement, facturation récurrente, traitement offline autorisé — peuvent appliquer une tarification préacceptée contractuellement.

La règle et le consentement/contrat de référence doivent rester traçables.

## 60. Idempotence

Le calcul final et la création des écritures financières doivent être idempotents.

Une répétition de requête ne doit jamais créer deux frais ou deux commissions.

## 61. Concurrence

Les limites de volume, budgets promotionnels et paliers doivent résister aux transactions concurrentes.

Un budget de campagne ne doit pas être dépassé à cause de deux traitements simultanés.

## 62. Ledger

Chaque composant financier doit produire les écritures nécessaires dans le ledger.

Le moteur de pricing calcule ; le ledger comptabilise.

Aucun solde ne doit être modifié directement par le moteur de pricing.

## 63. Exemple d’écriture

Paiement 100 000 XOF avec frais commerçant 1% et commission partenaire 20% du frais :

```text
principal = 100 000
merchantFee = 1 000
partnerCommission = 200
MansaRevenue = 800
```

Les écritures doivent rester équilibrées selon le modèle comptable Mansa.

## 64. Réservation et règlement

Les frais et commissions peuvent être :

- comptabilisés immédiatement ;
- réservés ;
- reconnus après capture ;
- reconnus après règlement ;
- reconnus après période de risque.

La politique doit être explicite.

## 65. Commission en attente

Pour prévenir la fraude, une commission agent peut être :

```text
PENDING
AVAILABLE
HELD
REVERSED
PAID_OUT
```

La date de disponibilité peut dépendre du type d’opération.

## 66. Remboursement

Une opération remboursée doit utiliser la politique documentée du domaine remboursements.

Chaque composant initial précise :

```text
KEEP
REFUND_FULL
REFUND_PRO_RATA
REVERSE
MANUAL_REVIEW
```

## 67. Reversal technique

Un reversal avant finalisation peut neutraliser automatiquement les frais et commissions associés selon la phase de traitement.

Aucune commission ne doit survivre par erreur à une transaction finalement annulée si la politique prévoit son reversal.

## 68. Chargeback

Le chargeback peut entraîner :

- reprise de revenu ;
- frais réseau ;
- débit commerçant ;
- perte Mansa ;
- ajustement commission.

Ces effets doivent être séparés et liés au dossier de litige.

## 69. Échec partenaire

Si un fournisseur facture Mansa malgré une transaction échouée, le coût doit pouvoir être rapproché indépendamment du prix client.

Le moteur économique ne doit pas masquer ces écarts.

## 70. Exceptions commerciales

Une exception ponctuelle doit utiliser un objet dédié plutôt qu’une modification de règle globale.

Exemples :

- geste commercial ;
- client VIP ;
- incident de service ;
- contrat pilote ;
- correction approuvée.

## 71. Contrôle des exceptions

Une exception sensible doit enregistrer :

```text
reason
requestedBy
approvedBy
validFrom
validUntil
scope
maximumAmount
usageLimit
```

## 72. RBAC

Permissions recommandées :

```text
pricing.read
pricing.quote.read
pricing.plan.create
pricing.plan.update
pricing.plan.activate
pricing.plan.retire
pricing.rule.create
pricing.rule.approve
pricing.exception.create
pricing.exception.approve
pricing.contract.manage
pricing.export
```

## 73. Séparation des tâches

Pour les règles sensibles :

```text
MAKER -> CHECKER
```

La personne qui crée une hausse de frais ou une nouvelle commission ne doit pas nécessairement pouvoir l’activer seule.

## 74. Seuils d’approbation

Une validation renforcée peut être requise pour :

- hausse de prix client ;
- baisse importante de marge ;
- tarif État ;
- commission agent massive ;
- contrat stratégique ;
- gratuité non budgétée ;
- subvention ;
- changement fiscal.

## 75. Dates d’effet

Toute règle doit avoir :

```text
validFrom
validUntil
status
```

États recommandés :

```text
DRAFT
REVIEW
APPROVED
SCHEDULED
ACTIVE
SUSPENDED
RETIRED
```

## 76. Activation future

Une règle peut être programmée pour une date future.

Le système doit éviter les conflits avec une autre règle active au même périmètre.

## 77. Rollback

Un rollback commercial consiste à activer une nouvelle version rétablissant l’ancienne logique.

Il ne réécrit pas les transactions déjà passées.

## 78. Simulation

Avant activation, l’administration doit pouvoir simuler une règle sur :

- montants types ;
- transactions historiques anonymisées/contrôlées ;
- segments ;
- volumes estimés.

La simulation ne crée aucune écriture financière.

## 79. Impact financier

La simulation peut estimer :

```text
customerFees
merchantFees
agentCommissions
partnerCosts
MansaGrossRevenue
MansaNetRevenue
```

## 80. Comparaison de versions

L’interface admin doit afficher les différences :

```text
ancienne règle -> nouvelle règle
```

avec impact estimé lorsque possible.

## 81. Audit

Chaque changement conserve :

- auteur ;
- approbateur ;
- horodatage ;
- ancienne version ;
- nouvelle version ;
- motif ;
- ticket ou référence ;
- périmètre ;
- date d’effet.

## 82. Anti-fraude interne

Alertes possibles :

- création répétée d’exceptions ;
- baisse anormale de frais pour un compte ;
- augmentation de commission d’un agent lié à l’opérateur ;
- activation hors procédure ;
- modification juste avant gros volume ;
- règles incohérentes avec contrat.

## 83. Risk engine

Le moteur de risque peut utiliser le prix comme signal, mais il ne doit pas modifier arbitrairement un tarif sans politique autorisée.

Exemple autorisé : surcharge explicitement contractuelle pour un service optionnel.

Une pénalité de risque opaque au client est à éviter.

## 84. Multi-tenant

Une organisation ne doit jamais voir ou modifier les tarifs confidentiels d’une autre organisation.

Les opérateurs Mansa privilégiés doivent être audités.

## 85. Environnements

Les règles de :

```text
DEMO
TEST
STAGING
PRODUCTION
```

sont isolées.

Un tarif de test ne doit jamais être promu automatiquement en production.

## 86. Import/export

Les plans peuvent être exportés pour audit ou revue.

Un import doit être validé, versionné et soumis aux mêmes contrôles qu’une création manuelle.

## 87. API de quote

Exemple conceptuel :

```text
POST /pricing/quotes
```

Entrée : contexte de transaction.

Sortie : quote signée/logiquement liée au contexte, lignes de prix et expiration.

## 88. API d’administration

Exemples :

```text
GET /pricing/plans
POST /pricing/plans
POST /pricing/plans/{id}/versions
POST /pricing/versions/{id}/submit
POST /pricing/versions/{id}/approve
POST /pricing/versions/{id}/activate
```

Les actions sensibles utilisent permissions et audit.

## 89. Validation

Le moteur doit refuser :

- pourcentage invalide ;
- devise incohérente ;
- dates inversées ;
- paliers chevauchants ;
- plafond inférieur au minimum ;
- bénéficiaire inconnu ;
- règle sans périmètre ;
- conflit non résolu ;
- tarification produisant un total impossible.

## 90. Propriétés de sécurité

Le système doit garantir :

- aucune confiance dans le montant calculé par le client ;
- authentification et autorisation sur l’admin ;
- intégrité des versions ;
- journalisation ;
- secrets partenaires hors règles tarifaires ;
- aucune donnée sensible inutile dans les formules ;
- isolation tenant.

## 91. Observabilité

Métriques recommandées :

```text
pricing_quote_count
pricing_quote_error_rate
pricing_rule_resolution_latency
pricing_conflict_count
fee_revenue_total
commission_total
subsidy_total
discount_total
pricing_override_count
```

## 92. Alertes

Alertes possibles :

- règle introuvable ;
- quote impossible ;
- marge négative inattendue ;
- coût partenaire supérieur au revenu ;
- forte variation de frais ;
- exception massive ;
- règle active sans approbation attendue.

## 93. Reporting

Le reporting doit ventiler :

- revenu brut ;
- revenu net ;
- frais par produit ;
- frais par canal ;
- commissions ;
- coûts partenaires ;
- promotions ;
- subventions ;
- taxes ;
- marge unitaire ;
- marge par segment.

## 94. Réconciliation

Les coûts et revenus attendus doivent être rapprochés avec :

- acquéreurs ;
- réseaux ;
- opérateurs Mobile Money ;
- banques ;
- agents ;
- fournisseurs ;
- administrations ;
- concessionnaires.

## 95. Performance

Le calcul doit être suffisamment rapide pour les parcours temps réel : TPE, QR, wallet, agent et péage.

Les règles actives peuvent être mises en cache avec invalidation contrôlée lors d’une nouvelle activation.

## 96. Fonctionnement hors ligne

Pour les canaux autorisés hors ligne, un sous-ensemble de règles peut être mis en cache localement.

Ce cache doit être :

- signé/protégé ;
- versionné ;
- limité dans le temps ;
- resynchronisé ;
- incapable de créer un double débit.

Toute divergence est rapprochée au retour réseau.

## 97. Péage hors ligne

Le contrôleur local peut conserver le tarif applicable et les règles minimales nécessaires au passage.

La version de tarif utilisée est journalisée avec l’événement local puis synchronisée.

## 98. Tests unitaires

Couvrir au minimum :

- frais fixe ;
- pourcentage ;
- minimum ;
- maximum ;
- paliers ;
- progressive ;
- remise ;
- commission ;
- partage multi-acteurs ;
- taxe ;
- arrondi ;
- résolution de priorité ;
- dates d’effet.

## 99. Tests de concurrence

Tester :

- budget promo ;
- quota coupon ;
- activation simultanée ;
- quote + confirmation ;
- idempotence ;
- changement de version pendant transaction.

## 100. Tests financiers

Chaque scénario doit vérifier que :

```text
somme des débits = somme des crédits
```

selon le ledger et le modèle comptable applicable.

## 101. Tests de sécurité

Tester :

- modification sans permission ;
- accès cross-tenant ;
- activation sans approbation ;
- falsification d’un montant client ;
- réutilisation quote expirée ;
- tentative de commission négative ou excessive ;
- contournement de plafond.

## 102. Tests de remboursement

Vérifier l’impact de :

- remboursement total ;
- remboursement partiel ;
- reversal ;
- chargeback ;
- frais non remboursable ;
- commission conservée ;
- commission reprise au prorata.

## 103. Migration depuis tarifs codés en dur

Tout tarif existant codé en dur doit être inventorié puis migré progressivement vers le moteur.

La migration doit éviter un changement involontaire du prix en production.

## 104. Compatibilité ascendante

Les anciennes transactions continuent à référencer leur ancienne version tarifaire même après évolution du produit.

## 105. Documentation opérationnelle

Les équipes finance, support, opérations, conformité et produit doivent pouvoir comprendre :

- comment un tarif est calculé ;
- qui peut le modifier ;
- quand il prend effet ;
- comment corriger une erreur ;
- comment retrouver la règle d’une transaction.

## 106. Explicabilité

Pour toute transaction, un opérateur autorisé doit pouvoir obtenir :

```text
whyThisFee
appliedRule
ruleVersion
calculationBreakdown
beneficiaries
fundingSources
```

sans exposer au client des informations contractuelles confidentielles qui ne lui sont pas destinées.

## 107. UX client

L’interface doit privilégier :

- prix clair ;
- frais visibles avant confirmation lorsque requis ;
- pas de frais caché Mansa ;
- devise explicite ;
- libellés compréhensibles ;
- reçu cohérent avec le débit réel.

## 108. UX admin

L’administration doit pouvoir :

- filtrer les plans ;
- comparer versions ;
- simuler ;
- programmer activation ;
- voir historique ;
- exporter ;
- identifier les produits affectés ;
- consulter les approbations.

## 109. Principe de non-régression

L’ajout du moteur de pricing ne doit supprimer aucun canal, produit ou modèle commercial existant.

Il centralise la logique économique tout en laissant chaque domaine appliquer ses règles métier propres.

## 110. Résultat attendu

Mansa doit disposer d’un moteur de tarification central, configurable, auditable et multi-produit permettant de gérer frais, commissions, coûts, taxes, promotions, subventions et partage de revenus de manière cohérente avec le ledger, les contrats, les partenaires, les agents et le secteur public.

Chaque transaction doit pouvoir être expliquée financièrement de bout en bout : montant de base, frais facturés, remises, coûts, commissions, bénéficiaires, revenu Mansa, version de règle appliquée et traitement en cas de correction.