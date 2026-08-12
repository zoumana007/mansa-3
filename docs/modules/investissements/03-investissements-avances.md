# Investissements avancés Mansa

## 1. Objet et positionnement

Ce document définit le module **Investissements avancés** de Mansa. Il couvre l’accès à des produits d’investissement distribués ou exécutés par des partenaires réglementés, le suivi de portefeuille, les marchés boursiers, les actions, obligations, ETF, fonds, dividendes, produits de financement d’entreprises et opportunités alternatives autorisées telles que PME, immobilier, agriculture ou énergie.

Le module doit rester **agnostique vis-à-vis des partenaires et des places de marché**. Mansa ne doit jamais supposer qu’un instrument, un courtier, une bourse, un dépositaire, une SGI, une banque, une plateforme de crowdfunding, une société de gestion ou une infrastructure de règlement-livraison est disponible sans contrat, agrément ou intégration réelle.

Mansa agit comme couche d’expérience, d’orchestration, d’administration, de conformité, de tarification, de reporting et d’intégration. Les responsabilités réglementées doivent être attribuées explicitement au partenaire juridiquement habilité dans chaque pays et pour chaque produit.

La BRVM constitue un marché important pour l’Afrique de l’Ouest, mais ne doit pas être codée comme unique marché. L’architecture doit permettre d’activer d’autres marchés et partenaires ultérieurement sans refonte.

## 2. Principes directeurs

1. **Conformité avant distribution** : aucun produit n’est visible, souscriptible ou négociable si les règles du pays, du profil client, du partenaire et du produit ne l’autorisent pas.
2. **Partenaires abstraits** : broker, SGI, banque, société de gestion, dépositaire, custodian, bourse, crowdfunding ou infrastructure de règlement sont derrière des adaptateurs versionnés.
3. **Séparation des responsabilités** : Mansa doit identifier qui détient les fonds, qui exécute l’ordre, qui conserve les titres, qui calcule la VL, qui produit les confirmations et qui porte l’obligation réglementaire.
4. **Traçabilité totale** : ordre, souscription, annulation, exécution, dividende, coupon, remboursement, frais, changement de statut, décision de conformité et action admin sont auditables.
5. **Ledger et positions dérivées** : aucun portefeuille ne dépend d’un simple champ modifiable. Les positions sont dérivées d’événements financiers, confirmations partenaires et rapprochements.
6. **Pricing centralisé** : tous les frais et commissions Mansa sont résolus par le Pricing & Commission Engine, jamais codés en dur.
7. **Protection investisseur** : le client voit risques, frais, devise, liquidité, horizon, partenaire, documents et règles de sortie avant engagement.
8. **Pas de promesse de rendement** : aucune interface, notification ou IA ne doit présenter un rendement futur comme garanti sauf produit juridiquement garanti et explicitement documenté par un partenaire habilité.
9. **Suitability / appropriateness configurable** : questionnaire, limites et avertissements sont adaptés au cadre applicable et au type de produit.
10. **Multi-pays et multi-devises natifs** : disponibilité, fiscalité, frais, documents et restrictions sont pilotés par configuration.

## 3. Périmètre fonctionnel

Le module couvre, lorsque juridiquement et techniquement activé :

- actions cotées ;
- obligations souveraines ou privées ;
- ETF ;
- OPCVM / fonds communs / fonds d’investissement ;
- fonds monétaires ;
- produits distribués par banques ou sociétés de gestion ;
- dividendes ;
- coupons obligataires ;
- remboursements à maturité ;
- introductions ou opérations primaires accessibles via partenaire ;
- levées de fonds d’entreprises ;
- financement de PME ;
- financement immobilier ;
- financement agricole ;
- financement énergétique ;
- autres projets ou véhicules d’investissement autorisés par pays ;
- portefeuille consolidé ;
- watchlists ;
- alertes ;
- reporting et performance ;
- ordres d’achat/vente lorsque le partenaire le permet ;
- souscriptions/rachats de fonds ;
- distribution de revenus ;
- historique documentaire et confirmations.

Hors périmètre par défaut : dérivés complexes, effet de levier, marge, short selling, options, futures et produits hautement spéculatifs. Ces capacités nécessitent un module dédié, une autorisation explicite et des contrôles réglementaires spécifiques.

## 4. Architecture produit

Le domaine est découpé en sous-modules :

1. `InvestmentCatalog` : catalogue des produits et instruments.
2. `MarketData` : prix, NAV/VL, courbes, performances et métadonnées.
3. `InvestmentAccount` : relation entre un client Mansa et un compte partenaire d’investissement.
4. `OrderManagement` : ordres boursiers et opérations de souscription/rachat.
5. `Portfolio` : positions, valorisation, P&L, revenus et allocation.
6. `CorporateActions` : dividendes, coupons, splits, remboursements, offres.
7. `Fundraising` : opportunités primaires, PME et projets.
8. `SuitabilityAndRisk` : profil, questionnaire, contraintes et avertissements.
9. `Compliance` : KYC/KYB, sanctions, PEP, AML, origine des fonds, limites.
10. `InvestmentPricing` : intégration au Pricing & Commission Engine.
11. `Reconciliation` : comparaison Mansa/partenaire et résolution des écarts.
12. `InvestmentAdmin` : configuration, partenaires, pays, produits, contrôles et reporting.

## 5. Acteurs

### 5.1 Investisseur particulier

Utilisateur ayant un compte Mansa et, si nécessaire, un compte d’investissement ouvert chez un partenaire réglementé.

### 5.2 Entreprise / investisseur professionnel

Organisation pouvant investir selon ses autorisations, ses mandats internes et les exigences KYB.

### 5.3 Émetteur / porteur de projet

Entreprise, institution ou véhicule qui souhaite lever des fonds, sous réserve de validation juridique et réglementaire.

### 5.4 Partenaire réglementé

Exemples abstraits : SGI, broker, banque, société de gestion, dépositaire, plateforme de crowdfunding, intermédiaire agréé ou opérateur de marché.

### 5.5 Administrateurs Mansa

Rôles séparés : produit, conformité, risque, finance, support, opérations, partenaire, pricing, audit.

## 6. Catégories de produits

Enumération indicative `InvestmentProductType` :

- `LISTED_EQUITY`
- `GOVERNMENT_BOND`
- `CORPORATE_BOND`
- `ETF`
- `MUTUAL_FUND`
- `MONEY_MARKET_FUND`
- `PRIVATE_FUND`
- `PRIMARY_OFFERING`
- `SME_FINANCING`
- `REAL_ESTATE_PROJECT`
- `AGRICULTURE_PROJECT`
- `ENERGY_PROJECT`
- `INFRASTRUCTURE_PROJECT`
- `OTHER_REGULATED_PRODUCT`

Chaque produit référence : juridiction, partenaire distributeur, partenaire exécuteur, partenaire de conservation, devise, document légal, catégorie de risque, liquidité, minimum, maximum, règles fiscales déclaratives disponibles et feature flags.

## 7. Catalogue d’investissement

Chaque produit possède au minimum :

- `productId` ;
- `productType` ;
- `issuerId` ;
- `partnerId` ;
- `marketId` facultatif ;
- `isin` ou identifiant externe lorsqu’existant ;
- `symbol` facultatif ;
- `name` ;
- `shortDescription` ;
- `currency` ;
- `countryScope[]` ;
- `riskLevel` ;
- `liquidityClass` ;
- `minimumInvestment` ;
- `maximumInvestment` ;
- `subscriptionStartAt` / `subscriptionEndAt` si applicable ;
- `maturityDate` si applicable ;
- `couponRate` si instrument de dette et si publiable ;
- `distributionPolicy` ;
- `documents[]` ;
- `status` ;
- `pricingProfileId` ;
- `featureFlagKey` ;
- `legalDisclaimerVersion`.

## 8. États du produit

`InvestmentProductStatus` :

- `DRAFT`
- `PENDING_REVIEW`
- `PENDING_PARTNER_APPROVAL`
- `APPROVED`
- `SCHEDULED`
- `ACTIVE`
- `SUBSCRIPTION_CLOSED`
- `SUSPENDED`
- `MATURED`
- `REDEEMED`
- `CANCELLED`
- `ARCHIVED`

Aucun produit `DRAFT`, `PENDING_REVIEW` ou `SUSPENDED` ne peut accepter de nouvel ordre.

## 9. Comptes d’investissement

`InvestmentAccount` représente la relation entre Mansa et le compte du partenaire.

Champs recommandés :

- `id` ;
- `userId` ou `organizationId` ;
- `partnerId` ;
- `externalAccountReference` chiffrée ;
- `countryCode` ;
- `baseCurrency` ;
- `status` ;
- `kycLevel` ;
- `suitabilityProfileId` ;
- `openedAt` ;
- `closedAt` ;
- `lastReconciledAt`.

`InvestmentAccountStatus` : `PENDING`, `PENDING_DOCUMENTS`, `PENDING_PARTNER`, `ACTIVE`, `RESTRICTED`, `SUSPENDED`, `CLOSING`, `CLOSED`, `REJECTED`.

## 10. Onboarding investisseur

Parcours recommandé :

1. découverte du module ;
2. vérification de disponibilité dans le pays ;
3. KYC ou mise à niveau KYC ;
4. collecte des informations réglementaires supplémentaires nécessaires ;
5. profil de risque / connaissances si applicable ;
6. consentements et documents ;
7. ouverture ou association du compte partenaire ;
8. validation partenaire ;
9. activation ;
10. affichage du catalogue compatible.

Les données déjà connues par Mansa ne doivent pas être redemandées inutilement. Elles peuvent être réutilisées après vérification de fraîcheur et consentement approprié.

## 11. Profil investisseur et suitability

Le moteur doit pouvoir évaluer :

- expérience financière ;
- connaissances ;
- horizon ;
- objectif ;
- capacité de perte ;
- tolérance au risque ;
- contraintes réglementaires ;
- statut professionnel ou non ;
- concentration du portefeuille ;
- exposition devise.

Le résultat ne doit pas être utilisé comme conseil financier automatique sauf service autorisé. Il sert principalement à filtrer, avertir, demander une confirmation renforcée ou bloquer selon le cadre applicable.

## 12. Marchés et données de marché

`Market` :

- `marketId` ;
- `name` ;
- `countryOrRegion` ;
- `timezone` ;
- `tradingCalendar` ;
- `settlementModel` ;
- `status` ;
- `dataProviderId` ;
- `executionPartnerIds[]`.

Le module doit supporter la BRVM via adaptateur lorsque contractualisée, ainsi que d’autres marchés futurs.

Les données de marché doivent indiquer :

- source ;
- horodatage ;
- caractère temps réel ou différé ;
- devise ;
- type de prix ;
- état du marché.

Mansa ne doit jamais afficher un prix différé comme temps réel.

## 13. Watchlist et découverte

Fonctions :

- recherche ;
- filtres par catégorie ;
- filtres pays/devise/risque ;
- favoris ;
- alertes de prix ;
- alertes de variation ;
- alertes de disponibilité ;
- actualités partenaires ou données autorisées ;
- comparaison de produits lorsque comparable.

Les comparaisons doivent éviter de juxtaposer des produits non homogènes de manière trompeuse.

## 14. Ordres boursiers

Selon capacités du partenaire :

`OrderType` :

- `MARKET`
- `LIMIT`
- `STOP` uniquement si partenaire et marché le permettent ;
- `SUBSCRIPTION`
- `REDEMPTION`

`OrderSide` : `BUY`, `SELL`.

États :

- `DRAFT`
- `VALIDATING`
- `PENDING_FUNDING`
- `PENDING_SUBMISSION`
- `SUBMITTED`
- `ACKNOWLEDGED`
- `PARTIALLY_FILLED`
- `FILLED`
- `CANCEL_REQUESTED`
- `CANCELLED`
- `REJECTED`
- `EXPIRED`
- `FAILED`
- `SETTLEMENT_PENDING`
- `SETTLED`
- `REVERSED`

Un ordre ne doit jamais être marqué `FILLED` sur la seule base d’un clic client. L’état d’exécution vient du partenaire exécuteur.

## 15. Parcours achat

1. sélection instrument ;
2. affichage prix ou dernière donnée disponible ;
3. saisie quantité/montant ;
4. contrôle disponibilité produit/pays/profil ;
5. contrôle solde ou funding ;
6. estimation frais Mansa, frais partenaire, frais marché et taxes connues ;
7. présentation du montant total estimé ;
8. consentement ;
9. authentification renforcée si requise ;
10. création ordre idempotent ;
11. soumission partenaire ;
12. suivi exécution ;
13. confirmation d’exécution ;
14. règlement-livraison ;
15. mise à jour portefeuille ;
16. reçu/confirmation et audit.

Un montant estimé doit être explicitement indiqué comme tel lorsque prix ou frais externes peuvent varier.

## 16. Parcours vente

Le système vérifie :

- quantité réellement disponible ;
- titres bloqués/réservés ;
- restrictions de marché ;
- produit suspendu ;
- fenêtre de négociation ;
- conformité ;
- frais ;
- éventuelles contraintes fiscales déclaratives ;
- liquidité.

La vente peut être partielle et doit gérer les exécutions multiples.

## 17. Fonds et OPCVM

Les fonds peuvent fonctionner sur logique de souscription/rachat et non sur carnet d’ordres.

Le modèle supporte :

- VL/NAV ;
- cut-off ;
- date de valeur ;
- délai de règlement ;
- minimum de souscription ;
- minimum de rachat ;
- frais d’entrée/sortie ;
- frais de gestion informatifs ;
- distribution ou capitalisation ;
- statut de souscription.

Mansa distingue frais externes du fonds et frais propres à Mansa.

## 18. Obligations

Métadonnées :

- émetteur ;
- nominal ;
- coupon ;
- fréquence coupon ;
- maturité ;
- devise ;
- calendrier ;
- statut ;
- mécanisme d’achat ;
- marché primaire/secondaire ;
- risque émetteur ;
- documents.

Les coupons et remboursements à maturité sont traités comme événements financiers réconciliés.

## 19. Dividendes et corporate actions

`CorporateActionType` :

- `DIVIDEND_CASH`
- `COUPON`
- `REDEMPTION`
- `SPLIT`
- `REVERSE_SPLIT`
- `RIGHTS_ISSUE`
- `TENDER_OFFER`
- `MERGER`
- `OTHER`

Chaque événement doit avoir source partenaire, date d’annonce, date ex, record date, payment date et statut.

Les dividendes/coupons ne sont crédités qu’après confirmation du partenaire ou du ledger de règlement.

## 20. Portefeuille

L’écran portefeuille affiche :

- valeur totale ;
- cash disponible si applicable ;
- positions ;
- quantité ;
- prix moyen ;
- valeur actuelle ;
- performance non réalisée ;
- performance réalisée ;
- dividendes/coupons reçus ;
- allocation par classe ;
- allocation par devise ;
- allocation par pays ;
- historique de valeur ;
- mouvements ;
- documents.

Les méthodes de calcul doivent être documentées et cohérentes. Le frontend ne recalcule pas arbitrairement une performance différente du backend.

## 21. Modèle `Position`

Champs :

- `investmentAccountId` ;
- `productId` ;
- `quantity` ;
- `availableQuantity` ;
- `reservedQuantity` ;
- `averageCost` ;
- `costCurrency` ;
- `marketValue` ;
- `valuationCurrency` ;
- `lastPrice` ;
- `lastPriceAt` ;
- `unrealizedPnl` ;
- `realizedPnl` ;
- `lastReconciledAt`.

La position est reconstruisible depuis événements/exécutions et confirmations partenaires.

## 22. Levées de fonds et financement d’entreprises

Le sous-module `Fundraising` ne doit pas être confondu avec une cagnotte.

Il peut couvrir, si le cadre applicable le permet :

- émission de titres ;
- obligations ou dette privée ;
- participation ;
- crowdfunding réglementé ;
- financement projet ;
- financement PME ;
- véhicules d’investissement.

Chaque offre est publiée uniquement après validation partenaire/réglementaire.

## 23. Dossier émetteur

Données possibles :

- identité juridique ;
- KYB ;
- bénéficiaires effectifs ;
- dirigeants ;
- documents légaux ;
- états financiers ;
- business plan ;
- montant recherché ;
- instrument proposé ;
- valorisation ou conditions ;
- risques ;
- utilisation des fonds ;
- échéancier ;
- garanties si applicables ;
- partenaire réglementé ;
- documents d’offre ;
- historique de validation.

Aucun document sensible ne doit être rendu public par défaut.

## 24. États d’une levée

`FundraisingStatus` :

- `DRAFT`
- `KYB_PENDING`
- `REVIEW_PENDING`
- `PARTNER_REVIEW`
- `REGULATORY_REVIEW`
- `APPROVED`
- `SCHEDULED`
- `OPEN`
- `PAUSED`
- `FULLY_SUBSCRIBED`
- `CLOSED`
- `SETTLEMENT_PENDING`
- `FUNDED`
- `REJECTED`
- `CANCELLED`
- `DEFAULTED`
- `COMPLETED`
- `ARCHIVED`

## 25. Immobilier

Le module immobilier peut représenter :

- véhicule d’investissement ;
- participation réglementée ;
- dette projet ;
- fonds immobilier ;
- autre structure autorisée.

À afficher : nature juridique, porteur, localisation, financement recherché, horizon, risques, revenus projetés lorsqu’ils sont fournis légalement, absence de garantie, documents et mécanisme de sortie.

Mansa ne doit pas présenter une simple propriété immobilière comme un titre librement négociable si ce n’est pas juridiquement le cas.

## 26. Agriculture

Le financement agricole doit intégrer :

- type de projet ;
- cycle agricole ;
- localisation générale sans exposer inutilement des données privées ;
- calendrier ;
- risques climatiques ;
- risques prix ;
- assurance éventuelle ;
- structure d’investissement ;
- partenaire ;
- utilisation des fonds ;
- reporting projet.

## 27. Énergie

Exemples : solaire, mini-réseaux, efficacité énergétique, infrastructures autorisées.

Les données ESG ou impact ne doivent être présentées comme vérifiées que si une source ou méthodologie est identifiée.

## 28. Paiement et funding

Sources possibles, selon activation :

- wallet Mansa ;
- virement bancaire ;
- Mobile Money ;
- carte lorsque permise ;
- compte espèces chez partenaire ;
- autres rails réglementés.

Mansa doit distinguer :

- dépôt sur compte d’investissement ;
- paiement d’une souscription ;
- règlement d’un ordre ;
- retrait de cash ;
- transfert vers wallet Mansa.

Aucune chaîne de mouvement ne doit contourner les contrôles AML ou les restrictions de retrait du partenaire.

## 29. Pricing & Commission Engine

Tous les frais sont configurables sans changement de code.

Le moteur supporte :

- frais fixes ;
- pourcentage ;
- fixe + pourcentage ;
- minimum ;
- maximum ;
- paliers ;
- gratuité ;
- nombre d’opérations gratuites ;
- promotions ;
- segmentation client ;
- pays ;
- devise ;
- produit ;
- marché ;
- partenaire ;
- canal ;
- volume ;
- statut client ;
- dates de début/fin ;
- frais d’achat ;
- frais de vente ;
- frais de souscription ;
- frais de rachat ;
- frais de retrait ;
- commission Mansa ;
- commission partenaire ;
- commission apporteur ;
- taxes séparées ;
- frais externes transmis par partenaire.

### 29.1 Versioning

Chaque opération conserve :

- `pricingPolicyId` ;
- `pricingPolicyVersion` ;
- `pricingSnapshot` ;
- base de calcul ;
- frais Mansa ;
- frais partenaires ;
- taxes ;
- montant brut ;
- montant net ;
- horodatage.

Un changement futur ne modifie jamais les opérations passées.

### 29.2 Workflow admin

`DRAFT -> SIMULATED -> PENDING_APPROVAL -> APPROVED -> SCHEDULED -> ACTIVE -> EXPIRED/REVOKED`.

Les changements sensibles exigent une séparation maker/checker.

## 30. Taxes

Mansa doit permettre de représenter des taxes et retenues fournies par les partenaires ou règles locales, mais ne doit pas devenir moteur fiscal improvisé.

Chaque prélèvement doit préciser :

- nature ;
- juridiction ;
- source de calcul ;
- caractère estimé ou confirmé ;
- partenaire responsable ;
- référence documentaire.

## 31. RBAC / ABAC

Rôles possibles :

- `INVESTMENT_PRODUCT_ADMIN`
- `INVESTMENT_PARTNER_ADMIN`
- `INVESTMENT_OPERATIONS`
- `INVESTMENT_COMPLIANCE`
- `INVESTMENT_RISK`
- `INVESTMENT_SUPPORT`
- `INVESTMENT_FINANCE`
- `INVESTMENT_PRICING_ADMIN`
- `INVESTMENT_PRICING_APPROVER`
- `INVESTMENT_AUDITOR`

ABAC : pays, partenaire, type de produit, niveau de risque, montant, organisation, classification client.

Un opérateur support ne peut jamais modifier une exécution ou un solde.

## 32. API principales

Exemples :

- `GET /investments/products`
- `GET /investments/products/:id`
- `GET /investments/markets`
- `GET /investments/quotes/:productId`
- `POST /investments/accounts`
- `GET /investments/accounts/:id`
- `POST /investments/orders/preview`
- `POST /investments/orders`
- `GET /investments/orders/:id`
- `POST /investments/orders/:id/cancel`
- `GET /investments/portfolio`
- `GET /investments/positions`
- `GET /investments/corporate-actions`
- `GET /investments/cashflows`
- `POST /investments/watchlist`
- `DELETE /investments/watchlist/:productId`
- `GET /investments/fundraisings`
- `GET /investments/fundraisings/:id`
- `POST /investments/fundraisings/:id/subscribe/preview`
- `POST /investments/fundraisings/:id/subscribe`

Toutes les écritures financières utilisent idempotency key, correlation ID et audit context.

## 33. Webhooks partenaires

Événements :

- `investment.account.updated`
- `investment.order.acknowledged`
- `investment.order.partially_filled`
- `investment.order.filled`
- `investment.order.rejected`
- `investment.settlement.completed`
- `investment.settlement.failed`
- `investment.position.updated`
- `investment.cash.available`
- `investment.dividend.announced`
- `investment.dividend.paid`
- `investment.coupon.paid`
- `investment.product.suspended`
- `investment.fundraising.updated`

Sécurité : signature, timestamp, replay protection, rotation de secret, IP controls lorsque disponible, journalisation, dead-letter queue et retries idempotents.

## 34. Adaptateurs partenaires

Interfaces recommandées :

- `BrokerExecutionProvider`
- `InvestmentAccountProvider`
- `CustodyProvider`
- `MarketDataProvider`
- `FundProvider`
- `FundraisingProvider`
- `SettlementProvider`
- `CorporateActionsProvider`

Aucun composant métier ne doit dépendre directement d’un SDK fournisseur.

## 35. Feature flags

Exemples :

- `investments.enabled`
- `investments.country.ML.enabled`
- `investments.listed_equities.enabled`
- `investments.bonds.enabled`
- `investments.funds.enabled`
- `investments.etf.enabled`
- `investments.fundraising.enabled`
- `investments.real_estate.enabled`
- `investments.agriculture.enabled`
- `investments.energy.enabled`
- `investments.buy.enabled`
- `investments.sell.enabled`
- `investments.alerts.enabled`

Ils peuvent être restreints par pays, partenaire, cohort, environnement et rôle.

## 36. Multi-pays

`InvestmentCountryPolicy` définit :

- disponibilité du module ;
- produits autorisés ;
- partenaires ;
- KYC requis ;
- questionnaires ;
- limites ;
- moyens de funding ;
- devises ;
- documents ;
- conservation ;
- restrictions de commercialisation ;
- règles d’âge ;
- exigences d’affichage ;
- retraits ;
- feature flags.

Le frontend ne décide jamais seul qu’un produit est légal dans un pays.

## 37. Multi-devises

Chaque valeur conserve sa devise d’origine.

Le portefeuille peut présenter une devise d’affichage choisie, mais toute conversion doit utiliser :

- source du taux ;
- timestamp ;
- paire ;
- taux ;
- caractère indicatif ou exécuté.

La valorisation convertie ne change pas la devise native de l’actif.

## 38. Sécurité

Exigences :

- chiffrement en transit et au repos ;
- secret manager ;
- aucune clé partenaire dans le dépôt ;
- MFA/step-up auth pour actions sensibles ;
- device/risk signals ;
- session management ;
- rate limiting ;
- idempotence ;
- séparation des rôles ;
- journal d’audit append-only ;
- contrôle d’accès aux documents ;
- chiffrement des références externes sensibles ;
- rotation des credentials ;
- détection d’anomalies ;
- protection contre webhook replay.

## 39. Fraude et abus

Signaux possibles :

- account takeover ;
- funding suivi de retrait immédiat ;
- multiplication de comptes ;
- identité incohérente ;
- device partagé anormalement ;
- source de fonds atypique ;
- tentative de contournement de limites ;
- manipulation de collecte ;
- faux documents émetteur ;
- activité inhabituelle par rapport au profil.

Actions : `ALLOW`, `STEP_UP`, `REVIEW`, `LIMIT`, `HOLD`, `BLOCK`, `REJECT`.

## 40. AML / sanctions / PEP

Les contrôles sont appliqués selon risque et réglementation :

- screening initial ;
- screening périodique ;
- contrôle bénéficiaires effectifs ;
- origine des fonds lorsque requise ;
- surveillance transactionnelle ;
- escalade conformité ;
- gel/restriction selon instruction légale ou partenaire habilité.

Les raisons sensibles ne sont pas nécessairement exposées intégralement au client.

## 41. Audit

`InvestmentAuditEvent` inclut :

- actor ;
- role ;
- tenant ;
- country ;
- resourceType ;
- resourceId ;
- action ;
- beforeHash ;
- afterHash ;
- reason ;
- correlationId ;
- timestamp ;
- device/context si pertinent.

Les opérations financières ne doivent pas être supprimables physiquement par un administrateur standard.

## 42. Minimisation des données

Ne stocker que les données nécessaires à :

- exécution ;
- conformité ;
- relation partenaire ;
- audit ;
- preuve ;
- obligations de conservation ;
- support.

Les documents volumineux sont référencés dans un stockage sécurisé avec contrôle d’accès et politique de rétention.

## 43. Réseau faible et mode hors ligne

La consultation peut utiliser cache contrôlé pour :

- catalogue ;
- watchlist ;
- dernières positions ;
- documents publics ;
- données de marché avec timestamp clair.

En revanche, aucune exécution d’ordre réelle ne doit être considérée confirmée hors ligne.

Un ordre préparé hors ligne peut être conservé comme brouillon local chiffré, puis revalidé entièrement à la reconnexion : prix, marché, solde, conformité, frais, limites et consentement doivent être recalculés.

## 44. Résilience

Le système doit gérer :

- partenaire indisponible ;
- timeout ;
- double webhook ;
- webhook en retard ;
- exécution partielle ;
- règlement échoué ;
- divergence de position ;
- prix indisponible ;
- marché fermé ;
- produit suspendu ;
- incident de conversion devise.

Aucune erreur technique ne doit créer une position artificielle.

## 45. Rapprochement

Rapprochements :

- ordres ;
- exécutions ;
- cash ;
- positions ;
- dividendes ;
- coupons ;
- frais ;
- retraits ;
- souscriptions ;
- levées de fonds.

`ReconciliationStatus` : `MATCHED`, `MISSING_INTERNAL`, `MISSING_EXTERNAL`, `AMOUNT_MISMATCH`, `QUANTITY_MISMATCH`, `STATUS_MISMATCH`, `UNDER_REVIEW`, `RESOLVED`.

Toute correction financière suit une écriture compensatrice, jamais une modification silencieuse de l’historique.

## 46. Administration

Le Super Admin / Investment Admin peut gérer selon permissions :

- pays ;
- partenaires ;
- marchés ;
- catalogue ;
- produits ;
- risques ;
- documents ;
- limites ;
- questionnaires ;
- feature flags ;
- pricing ;
- campagnes ;
- levées de fonds ;
- incidents ;
- réconciliations ;
- suspensions ;
- reporting ;
- audit.

Les actions critiques nécessitent maker/checker et justification.

## 47. Notifications

Événements possibles :

- compte activé ;
- document manquant ;
- ordre reçu ;
- ordre exécuté partiellement ;
- ordre exécuté ;
- ordre rejeté ;
- règlement terminé ;
- dividende/coupon reçu ;
- produit suspendu ;
- alerte prix ;
- échéance obligation ;
- levée ouverte/fermée ;
- document réglementaire mis à jour.

Les notifications ne doivent pas constituer de conseil personnalisé non autorisé.

## 48. IA / Jini

Jini peut, selon permissions :

- expliquer un terme ;
- résumer un document ;
- montrer la composition du portefeuille ;
- retrouver une transaction ;
- expliquer les frais ;
- aider à naviguer dans l’interface ;
- générer un résumé de performance factuel.

Jini ne doit pas :

- garantir un rendement ;
- inventer un prix ;
- exécuter un ordre sans authentification/confirmation requise ;
- recommander un produit comme conseil financier personnalisé si Mansa n’est pas habilité à fournir ce service ;
- masquer les risques.

## 49. Observabilité

Métriques :

- comptes actifs ;
- ouverture réussie/échouée ;
- ordres ;
- taux d’exécution ;
- latence partenaires ;
- erreurs ;
- encours suivi ;
- actifs par catégorie ;
- frais Mansa ;
- frais partenaires ;
- revenus ;
- réconciliations en écart ;
- incidents ;
- alertes fraude ;
- taux de conversion des levées.

Aucune donnée personnelle sensible ne doit apparaître dans les logs techniques standards.

## 50. Performance

Objectifs indicatifs à valider par environnement :

- catalogue et portefeuille p95 < 500 ms hors dépendances externes lentes ;
- preview d’ordre p95 < 1 s lorsque partenaires disponibles ;
- requêtes critiques instrumentées ;
- pagination systématique ;
- cache maîtrisé pour données non transactionnelles ;
- market data découplée des écritures financières.

## 51. Tests fonctionnels

Cas minimums :

- onboarding accepté/rejeté ;
- produit interdit par pays ;
- produit incompatible avec profil ;
- achat ;
- vente ;
- exécution partielle ;
- annulation ;
- ordre rejeté ;
- marché fermé ;
- fonds souscription/rachat ;
- dividende ;
- coupon ;
- remboursement obligataire ;
- levée de fonds ;
- montant minimum/maximum ;
- frais fixes/%/paliers ;
- promotion ;
- changement de pricing ;
- historique conservant ancienne version ;
- partenaire indisponible ;
- webhook dupliqué ;
- réconciliation en écart ;
- suspension produit.

## 52. Tests sécurité

- IDOR ;
- élévation de privilèges ;
- webhook replay ;
- modification de montant côté client ;
- altération du pricing snapshot ;
- double ordre ;
- race condition ;
- credential leakage ;
- document access ;
- injection ;
- rate limiting ;
- account takeover ;
- MFA bypass ;
- admin privilege separation.

## 53. Tests résilience

- timeout partenaire ;
- retry ;
- perte réseau ;
- webhook avant réponse API ;
- webhook après timeout ;
- événement hors ordre ;
- redémarrage worker ;
- message dupliqué ;
- base read replica en retard ;
- données de marché absentes ;
- panne du pricing engine avec stratégie fail-safe.

Aucun ordre ne doit être exécuté avec frais inconnus lorsque leur présentation préalable est obligatoire.

## 54. Modèles de données principaux

Entités recommandées :

- `InvestmentAccount`
- `InvestmentProduct`
- `Market`
- `MarketQuote`
- `InvestmentOrder`
- `OrderExecution`
- `Settlement`
- `Position`
- `CashBalance`
- `PortfolioSnapshot`
- `CorporateAction`
- `InvestmentCashflow`
- `WatchlistItem`
- `PriceAlert`
- `InvestorProfile`
- `SuitabilityAssessment`
- `FundraisingCampaign`
- `FundraisingSubscription`
- `Issuer`
- `InvestmentPartner`
- `InvestmentCountryPolicy`
- `InvestmentLimit`
- `InvestmentReconciliation`
- `InvestmentAuditEvent`

Chaque modèle financier possède `createdAt`, `updatedAt`, correlation/idempotency keys lorsque pertinent, et références immuables vers les événements externes.

## 55. Ordre de développement

### Phase 1 — Fondations

- modèles ;
- country policies ;
- partner abstractions ;
- investment account ;
- catalogue ;
- RBAC ;
- audit ;
- pricing integration.

### Phase 2 — Portefeuille en lecture

- market data ;
- positions ;
- valorisation ;
- historique ;
- watchlist ;
- documents.

### Phase 3 — Trading / souscriptions

- preview ;
- ordres ;
- exécutions ;
- settlement ;
- fonds ;
- notifications ;
- réconciliation.

### Phase 4 — Revenus et corporate actions

- dividendes ;
- coupons ;
- maturités ;
- événements.

### Phase 5 — Levées de fonds

- émetteurs ;
- KYB ;
- dossiers ;
- validation ;
- souscriptions ;
- reporting ;
- décaissements via partenaire habilité.

### Phase 6 — Extension

- immobilier ;
- agriculture ;
- énergie ;
- autres produits autorisés ;
- nouveaux marchés et pays.

## 56. Critères d’acceptation

Le module est considéré prêt pour intégration lorsque :

1. aucun partenaire n’est codé en dur ;
2. aucun instrument n’est activé sans country policy et partenaire ;
3. tous les ordres sont idempotents ;
4. les états d’ordre sont pilotés par confirmations réelles ;
5. le portefeuille est réconciliable ;
6. les frais sont intégralement configurables sans code ;
7. chaque opération conserve son pricing snapshot/version ;
8. les taxes/frais externes sont séparés des revenus Mansa ;
9. les rôles admin sensibles sont séparés ;
10. les documents et avertissements sont versionnés ;
11. les données de marché affichent leur fraîcheur ;
12. le mode hors ligne ne peut jamais simuler une exécution réelle ;
13. les levées de fonds restent distinctes des cagnottes ;
14. Jini n’exécute pas d’ordre sans les confirmations requises ;
15. les tests fonctionnels, sécurité et résilience critiques passent ;
16. les écarts de réconciliation sont détectables et auditables ;
17. l’ajout d’un nouveau partenaire ou marché ne nécessite pas une réécriture du cœur métier ;
18. l’administration peut activer/désactiver produits, pays, partenaires, limites, frais et feature flags ;
19. aucun rendement futur n’est présenté comme garanti sans fondement juridique explicite ;
20. l’historique financier reste immuable et reconstruisible.

## 57. Décisions structurantes à conserver

- **Investir** n’est pas limité à la BRVM.
- La BRVM est intégrable comme marché parmi d’autres via adaptateur.
- Actions, obligations, ETF, fonds, dividendes, portefeuille et levées de fonds font partie du périmètre avancé.
- PME, immobilier, agriculture et énergie sont des familles de financement à activer uniquement avec structure légale et partenaire appropriés.
- Mansa ne doit pas prétendre être broker, dépositaire, société de gestion ou conseiller financier sans habilitation correspondante.
- Les frais et commissions doivent toujours rester configurables depuis l’administration.
- Le moteur central de pricing est la seule source autorisée pour les frais Mansa ; les frais externes restent identifiables séparément.
- Toute opération historique conserve la version tarifaire réellement appliquée.
- La conformité, la disponibilité des produits et les limites sont pilotées par pays et partenaire.
- Aucun module futur ne doit contourner ces principes.