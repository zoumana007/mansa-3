# Tarification, frais, commissions et partage de revenus

## 1. Objet

Ce document définit le cahier des charges Mansa pour la tarification des services, les frais facturés aux clients, les commissions versées aux agents et partenaires, les partages de revenus, les subventions, les remises, les plafonds réglementaires et la gouvernance des changements de prix.

L’objectif est de disposer d’un moteur central, auditable et multi-pays capable de calculer un prix avant validation d’une opération, d’expliquer sa composition, d’appliquer les règles contractuelles et réglementaires, puis de comptabiliser correctement chaque composante.

## 2. Principes obligatoires

- aucun frais ne doit être calculé uniquement côté client ;
- le backend fait autorité sur le prix final ;
- le prix affiché avant confirmation doit être reproductible à partir d’une version de règle immuable ;
- tout changement de tarif doit être daté, versionné, attribué et audité ;
- les règles peuvent varier par pays, organisation, canal, produit, montant, segment et partenaire ;
- les plafonds réglementaires ou contractuels sont prioritaires sur les règles commerciales ;
- les montants monétaires sont stockés dans l’unité mineure appropriée ou un type décimal exact, jamais en flottant binaire ;
- les opérations financières sont idempotentes ;
- une règle expirée ou invalide ne doit pas produire de frais implicites ;
- toute gratuité, remise ou subvention doit rester traçable ;
- aucun agent, commerçant ou opérateur ne peut modifier rétroactivement un frais appliqué sans correction auditée ;
- les prix appliqués doivent rester explicables au support, à l’audit et au client lorsque la réglementation l’exige.

## 3. Périmètre

Le moteur couvre notamment :

```text
transferts P2P
cash-in
cash-out
paiements marchands
QR
TPE
cartes
retraits
recharges
Mobile Money
virements
transferts internationaux
change
factures
abonnements
services État
péages
livraison
assurance
crédit
API partenaires
Jini Voice lorsque facturé
```

## 4. Entités principales

Entités recommandées :

```text
PricingPlan
PricingRule
PricingRuleVersion
FeeComponent
CommissionRule
RevenueShareRule
SubsidyRule
DiscountRule
TaxRuleReference
PricingScope
PricingQuote
PricingBreakdown
PricingApproval
PricingPublication
PricingOverride
PricingAuditLog
PricingIncident
```

## 5. Types de frais

Types minimaux :

```text
FIXED
PERCENTAGE
FIXED_PLUS_PERCENTAGE
TIERED
MINIMUM
MAXIMUM
CAP
FLOOR
ZERO_FEE
PASS_THROUGH
PARTNER_FEE
NETWORK_FEE
FX_MARKUP
SERVICE_FEE
AGENT_COMMISSION
MERCHANT_COMMISSION
REVENUE_SHARE
TAX
SUBSIDY
DISCOUNT
```

## 6. Portées

Une règle peut être définie aux niveaux :

```text
GLOBAL
COUNTRY
LEGAL_ENTITY
ORGANIZATION
STATE_AGENCY
PARTNER
BANK
ACQUIRER
MOBILE_MONEY_OPERATOR
MERCHANT_GROUP
MERCHANT
AGENT_NETWORK
AGENT
PRODUCT
CHANNEL
DEVICE_TYPE
SITE
TOLL_NETWORK
TOLL_PLAZA
TOLL_LANE
USER_SEGMENT
```

La résolution doit utiliser une priorité explicite du plus spécifique au plus général.

## 7. Dimensions de calcul

Une règle peut dépendre de :

- montant ;
- devise ;
- pays d’origine et destination ;
- type de client ;
- statut KYC ;
- type d’agent ;
- produit ;
- canal ;
- moyen de paiement ;
- réseau carte ;
- partenaire ;
- heure/jour si légalement permis ;
- volume cumulé ;
- tranche ;
- abonnement ;
- campagne ;
- rôle ou convention spéciale ;
- classe de véhicule pour le péage.

## 8. Formule générale

Le moteur doit produire un `PricingQuote` avant exécution :

```text
principal
+ frais Mansa
+ frais partenaire répercutés
+ taxes applicables
+ marge FX éventuelle
- remise
- subvention
= total client
```

Le partage interne peut ensuite calculer :

```text
revenu brut
- commission agent
- commission partenaire
- coût réseau/acquéreur
- taxes supportées
= revenu net Mansa
```

Les deux calculs doivent être séparés afin de ne pas confondre montant facturé au client et économie interne de la transaction.

## 9. Devis de tarification

`PricingQuote` contient au minimum :

- quoteId ;
- produit ;
- montant principal ;
- devise ;
- total client ;
- détail des composantes ;
- règle/version utilisée ;
- date de création ;
- date d’expiration ;
- pays ;
- canal ;
- bénéficiaire économique de chaque composante ;
- taxes ;
- éventuelle subvention ;
- signature ou hash d’intégrité interne.

Un paiement ne doit pas réutiliser un devis expiré sans recalcul.

## 10. Tranches

Exemple générique :

```text
0 à 10 000 XOF      → règle A
10 001 à 50 000 XOF → règle B
50 001 à 200 000 XOF → règle C
> 200 000 XOF       → règle D ou plafond
```

Les bornes doivent être inclusives/exclusives de manière explicite afin d’éviter les chevauchements.

## 11. Frais en pourcentage

Pour un pourcentage :

```text
fee = principal × rate
```

Puis appliquer dans l’ordre configuré :

```text
minimum
maximum
arrondi monétaire
plafond réglementaire
```

L’ordre de calcul doit être versionné.

## 12. Frais à 1 % et contraintes marché

Le moteur doit permettre une politique telle que :

```text
client_fee_rate = 1.00%
```

sans imposer cette valeur en dur.

La répartition de ce 1 % peut être configurée entre Mansa, agent, partenaire, réseau ou subvention, sous réserve de viabilité économique et de conformité.

Exemple purement paramétrique :

```text
frais client = 1.00%
commission agent = variable
part partenaire = variable
part Mansa = résiduel ou règle explicite
```

Le système ne doit jamais supposer que l’agent travaille gratuitement.

## 13. Commission agents

La commission agent peut être :

```text
FIXED_PER_TRANSACTION
PERCENTAGE_OF_PRINCIPAL
PERCENTAGE_OF_FEE
TIERED_BY_VOLUME
BONUS_BY_TARGET
HYBRID
```

Elle peut dépendre de :

- cash-in/cash-out ;
- montant ;
- volume journalier/mensuel ;
- zone géographique ;
- type d’agent ;
- liquidité ;
- qualité de service ;
- campagne temporaire.

Le montant acquis doit être enregistré au moment de la transaction et ne pas être recalculé rétroactivement si le barème change ensuite.

## 14. Liquidité agent

La tarification ne doit pas encourager artificiellement un comportement mettant en danger la liquidité.

Le moteur peut distinguer :

```text
commission cash-in
commission cash-out
bonus rééquilibrage
bonus zone sous-desservie
```

Les bonus de liquidité doivent être plafonnés et audités.

## 15. Commissions commerçants

Le moteur doit gérer :

- MDR marchand ;
- frais fixes ;
- abonnement mensuel ;
- gratuité par volume ;
- partage acquéreur/réseau/Mansa ;
- frais remboursés ou non lors d’un refund ;
- conditions spécifiques par catégorie de commerce.

Le marchand doit pouvoir voir le montant brut, les frais, les retenues et le net attendu.

## 16. Réseaux cartes et acquéreurs

Les coûts Visa, Mastercard ou autres réseaux ne doivent pas être supposés constants ni garantis.

Le moteur utilise les paramètres fournis par l’acquéreur et les contrats réellement activés.

Le terminal carte accepte les réseaux activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles, sans prétendre accepter toutes les cartes du monde.

## 17. Mobile Money

Les frais liés à Mobile Money sont configurables par opérateur, pays, canal et produit.

Pour les péages, Mobile Money doit rester activable/désactivable par l’administration aux niveaux :

```text
NATIONAL
NETWORK
TOLL_PLAZA
LANE
```

Chaque changement possède :

- ancienne valeur ;
- nouvelle valeur ;
- date d’effet ;
- auteur ;
- motif ;
- audit.

La désactivation ne supprime jamais automatiquement le canal du produit.

## 18. Péages — principes de référence

Deux solutions coexistent :

```text
A. péage automatique classique avec barrière
B. télépéage RFID UHF avec barrière
```

Une évolution future optionnelle vers du free-flow sans barrière peut être ajoutée sans remplacer A ou B.

Le péage classique peut accepter selon configuration :

- billets FCFA ;
- pièces FCFA ;
- carte bancaire EMV multi-réseaux ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

## 19. Tarification péage

Le tarif peut dépendre de :

- réseau ;
- poste ;
- voie ;
- classe véhicule ;
- trajet ;
- abonnement ;
- concessionnaire ;
- exonération autorisée ;
- politique publique ;
- période si juridiquement autorisée.

Le tarif attendu doit être enregistré avant ouverture de barrière.

## 20. Anti-corruption péage

Le système rapproche obligatoirement autant que possible :

```text
véhicule détecté
→ catégorie
→ tarif attendu
→ paiement
→ autorisation d’ouverture
→ ouverture réelle
→ passage physique
```

Toute ouverture manuelle est auditée avec auteur, motif, voie, heure et transaction associée ou absence de transaction.

Une modification tarifaire ne doit jamais effacer l’ancien tarif appliqué à une transaction déjà réalisée.

## 21. Télépéage RFID

Le télépéage initial utilise :

- tag UHF RFID passif ;
- véhicule associé ;
- compte associé ;
- lecteur/antenne ;
- contrôleur local ;
- relais `OPEN` ;
- barrière ;
- capteurs de passage.

Le moteur de tarification renvoie localement ou via cache une règle valide avant débit.

## 22. Péage hors ligne

Le fonctionnement local doit conserver :

- tarifs en vigueur ;
- versions de règles ;
- moyens de paiement autorisés ;
- règles d’abonnement ;
- limites locales ;
- preuves d’intégrité.

Au retour du réseau :

```text
resynchronisation
→ contrôle idempotence
→ aucun double débit
→ rapprochement tarif/transaction/passage
```

## 23. Trois niveaux d’équipement péage

Le moteur doit fonctionner avec :

```text
FULL_AUTOMATIC
SEMI_AUTOMATIC
LOW_COST_DIGITIZED
```

L’État peut déployer progressivement les équipements sans devoir moderniser tous les postes immédiatement.

## 24. Matériel multi-fournisseurs

Le calcul tarifaire ne dépend pas d’un constructeur de borne.

Le matériel est piloté derrière des adaptateurs utilisant selon besoin :

- API ;
- SDK ;
- TCP/IP ;
- USB ;
- RS-232/RS-485 ;
- relais/contact sec ;
- interface industrielle documentée.

Deux modèles commerciaux restent supportés : matériel acheté par l’État/concessionnaire ou matériel fourni/intégré/revendu par Mansa.

## 25. Marque blanche péage

La tarification affichée sur borne, écran, reçu, tag et signalétique peut être personnalisée au nom de l’État ou du concessionnaire.

La mention `Propulsé par Mansa` est facultative.

Le branding ne modifie jamais le tarif calculé ni les règles financières.

## 26. Subventions

Une subvention peut être financée par :

- État ;
- partenaire ;
- Mansa ;
- marchand ;
- campagne ;
- programme social.

Le système enregistre séparément :

```text
prix économique réel
part payée par utilisateur
part subventionnée
financeur
référence programme
```

Une gratuité financée doit donc rester mesurable.

## 27. Remises et promotions

Les remises peuvent être :

```text
FIXED_DISCOUNT
PERCENTAGE_DISCOUNT
FIRST_N_TRANSACTIONS
VOLUME_DISCOUNT
PROMO_CODE
LOYALTY_REWARD
PARTNER_FUNDED
```

Elles doivent posséder dates, plafond, population cible et budget éventuel.

## 28. Cashback

Le cashback n’est pas un frais négatif implicite.

Il est comptabilisé comme une récompense distincte, avec financeur, règle et date d’acquisition.

## 29. Taxes

Le moteur référence les règles fiscales applicables sans les hardcoder dans les applications.

Une composante fiscale contient :

- juridiction ;
- type ;
- taux ou montant ;
- base taxable ;
- date d’effet ;
- texte/référence interne éventuelle ;
- bénéficiaire comptable.

Toute règle fiscale doit pouvoir être mise à jour sans réécrire l’historique.

## 30. Arrondis

Les stratégies possibles :

```text
HALF_UP
HALF_EVEN
DOWN
UP
CURRENCY_RULE
```

Le moteur doit utiliser une politique explicite par devise et produit.

Pour XOF, l’affichage doit respecter les unités effectivement encaissables lorsque le canal physique impose des contraintes de coupures/pièces.

## 31. Change et FX

Pour une opération de change :

```text
mid/reference rate
+/- spread
+ fee éventuel
= client rate
```

Le taux, la source, le timestamp, le spread et le devis final doivent être conservés.

## 32. Override manuel

Un override ne peut être appliqué que par rôle autorisé et doit comporter :

- motif ;
- auteur ;
- approbateur si nécessaire ;
- durée ;
- portée ;
- ancien résultat ;
- nouveau résultat.

Les overrides rétroactifs sur transactions finalisées sont interdits ; une correction comptable séparée est utilisée.

## 33. Double validation

Doivent pouvoir exiger une double validation :

- hausse de frais client ;
- changement national ;
- commission agent ;
- partage partenaire ;
- plafond ;
- taxe ;
- subvention publique ;
- règle péage ;
- gratuité massive ;
- activation d’un nouveau modèle tarifaire.

## 34. Cycle de vie d’une règle

Statuts :

```text
DRAFT
REVIEW
APPROVED
SCHEDULED
ACTIVE
PAUSED
EXPIRED
RETIRED
```

Une règle ne devient `ACTIVE` qu’après validation des contraintes et approbations nécessaires.

## 35. Versionnement

Chaque publication crée une version immuable contenant :

- règle complète ;
- diff ;
- auteur ;
- approbateurs ;
- date ;
- date d’effet ;
- motif ;
- hash ;
- éventuelle référence contractuelle.

## 36. Simulation

Avant publication, l’admin doit pouvoir simuler des cas :

```text
montant 1 000 XOF
montant 10 000 XOF
montant 300 000 XOF
cash-in
cash-out
paiement marchand
péage classe 1
péage classe poids lourd
```

Le simulateur affiche total client, revenu Mansa, commission agent/partenaire et éventuelles taxes.

## 37. Tests automatiques

Les tests couvrent :

- frontières de tranches ;
- minimum/maximum ;
- plafonds ;
- gratuité ;
- arrondis ;
- devis expiré ;
- changement de version ;
- concurrence ;
- idempotence ;
- multi-devise ;
- multi-tenant ;
- commission agent ;
- subvention ;
- taxes ;
- péage hors ligne ;
- resynchronisation sans double débit.

## 38. Sécurité

Le moteur doit appliquer :

- RBAC ;
- moindre privilège ;
- isolation multi-tenant ;
- journal d’audit immuable ;
- validation des entrées ;
- intégrité des règles ;
- protection contre modification non autorisée ;
- chiffrement en transit et au repos selon classification ;
- aucune clé ou secret dans les règles tarifaires.

## 39. Observabilité

Métriques recommandées :

```text
pricing_quote_count
pricing_quote_error_rate
pricing_rule_miss
fee_amount_total
commission_amount_total
subsidy_amount_total
pricing_override_count
pricing_mismatch_count
stale_pricing_cache
```

Une anomalie de calcul financier doit pouvoir déclencher une alerte.

## 40. Rapprochement comptable

Chaque transaction doit relier :

```text
transactionId
pricingQuoteId
pricingRuleVersion
ledger entries
commission entries
partner settlement entries
subsidy entries
tax entries
```

Le total des composantes doit être équilibré avec les écritures comptables correspondantes.

## 41. Remboursements

La politique doit préciser pour chaque composante si elle est :

```text
REFUNDABLE
NON_REFUNDABLE
PARTIALLY_REFUNDABLE
REVERSED_IF_UNSETTLED
```

La règle applicable est celle de la transaction d’origine, sauf obligation réglementaire contraire.

## 42. Litiges et chargebacks

Un chargeback ne doit pas recalculer arbitrairement les anciens frais.

Le système applique la politique contractuelle de récupération ou d’absorption des frais et conserve la référence au prix initial.

## 43. API

Endpoints indicatifs :

```text
POST /pricing/quotes
GET /pricing/quotes/:id
GET /admin/pricing/rules
POST /admin/pricing/rules
POST /admin/pricing/rules/:id/simulate
POST /admin/pricing/rules/:id/approve
POST /admin/pricing/rules/:id/publish
POST /admin/pricing/rules/:id/pause
GET /admin/pricing/audit
```

Les endpoints admin sont protégés par permissions fines.

## 44. Permissions

Permissions recommandées :

```text
pricing.read
pricing.simulate
pricing.create
pricing.edit
pricing.approve
pricing.publish
pricing.pause
pricing.override
pricing.audit.read
```

## 45. UX client

Avant une confirmation sensible, afficher selon le produit :

- montant envoyé/acheté ;
- frais ;
- taux de change si applicable ;
- taxe si nécessaire ;
- remise/subvention visible si pertinent ;
- total débité ;
- montant reçu par le bénéficiaire lorsque différent.

Le texte doit être clair et localisé.

## 46. UX agent et marchand

L’agent ou marchand doit distinguer :

```text
montant opération
frais client
commission acquise
net à régler
statut commission
```

Les commissions en attente de règlement ne doivent pas être présentées comme déjà disponibles.

## 47. Mode dégradé

Si le moteur central est indisponible :

- utiliser uniquement une règle cache valide et autorisée ;
- ne jamais inventer un frais ;
- respecter expiration et limites hors ligne ;
- journaliser la décision ;
- resynchroniser au retour réseau ;
- bloquer l’opération si aucune règle sûre n’est disponible.

## 48. Migration de tarifs

Une migration doit prévoir :

1. import des barèmes ;
2. validation ;
3. simulation ;
4. comparaison avec ancien système ;
5. double validation ;
6. publication planifiée ;
7. surveillance ;
8. rollback de configuration si nécessaire.

Les transactions historiques restent liées à leur ancienne version.

## 49. Critères d’acceptation

Le module est considéré conforme lorsque :

- une transaction obtient un devis déterministe ;
- les frais sont explicables et versionnés ;
- les agents reçoivent une commission calculée par règle ;
- les plafonds sont respectés ;
- les changements sont audités ;
- les règles multi-pays et multi-tenant sont isolées ;
- le hors ligne ne crée pas de double débit ;
- le péage conserve les deux solutions de référence ;
- Mobile Money reste configurable et jamais supprimé automatiquement ;
- l’anti-corruption rapproche tarif, paiement, ouverture et passage ;
- le ledger et les règlements partenaires peuvent réconcilier chaque composante.

## 50. Hors périmètre

Ce document ne fixe pas les tarifs commerciaux réels, les taux réglementaires ou les contrats partenaires. Ces valeurs doivent être configurées dans les environnements autorisés après validation juridique, financière et commerciale.
