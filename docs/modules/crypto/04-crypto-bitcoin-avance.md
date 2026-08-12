# 04 — Crypto & Bitcoin avancé

## 1. Objet du module

Ce document définit le cahier des charges fonctionnel, métier, technique, sécurité et conformité du module **Crypto & Bitcoin avancé** de Mansa.

Le module doit permettre à Mansa d’exposer, lorsque la réglementation locale et les contrats partenaires l’autorisent, des fonctions liées aux crypto-actifs sans supposer que Mansa soit elle-même dépositaire, exchange, broker ou prestataire réglementé. Toutes les capacités sensibles doivent être fournies derrière des interfaces partenaires abstraites, activables par pays, produit, utilisateur et environnement.

Le module couvre en priorité Bitcoin puis, selon pays et partenaires : autres crypto-actifs autorisés, stablecoins autorisés, achat, vente, conversion, dépôt, retrait, transferts, portefeuille, cours, historique, alertes, adresses blockchain, frais réseau, custody, conformité, limites, reporting et administration.

Le module doit être **désactivable intégralement** par pays ou juridiction via feature flags et politiques réglementaires. Aucun écran, appel API ou parcours ne doit promettre une capacité qui n’est pas réellement disponible contractuellement.

## 2. Principes directeurs

1. **Partner-first** : toutes les opérations réglementées reposent sur un ou plusieurs prestataires partenaires abstraits.
2. **Compliance-first** : disponibilité, limites, actifs, réseaux et parcours sont gouvernés par pays, niveau KYC, profil de risque et exigences partenaires.
3. **No false custody assumption** : le modèle doit distinguer explicitement custody Mansa, custody partenaire, self-custody et simple visualisation.
4. **Ledger-first** : toute opération visible dans Mansa doit être réconciliable avec un ledger interne, les données partenaire et, lorsque pertinent, la blockchain.
5. **Pricing configurable** : aucun frais ou commission métier ne doit être codé en dur.
6. **Audit immuable** : toute action sensible est journalisée.
7. **Multi-pays / multi-devise** : le module doit fonctionner avec des politiques, devises fiat, actifs et réseaux différents selon la juridiction.
8. **Fail-safe** : en cas d’incertitude réglementaire, technique ou de données, le système bloque l’opération plutôt que de l’exécuter à l’aveugle.

## 3. Périmètre fonctionnel

### 3.1 Consultation marché

L’utilisateur peut, selon les actifs activés :

- consulter la liste des crypto-actifs disponibles ;
- rechercher un actif ;
- afficher symbole, nom, logo, prix de référence, variation, market data disponible et horodatage ;
- consulter des graphiques sur plusieurs périodes ;
- voir la devise de cotation ;
- ajouter ou retirer un actif des favoris ;
- créer des alertes de prix ;
- consulter les avertissements de volatilité et risque ;
- voir si achat, vente, dépôt et retrait sont disponibles pour cet actif dans son pays.

La donnée de marché doit inclure : source, horodatage, statut de fraîcheur et éventuelle indisponibilité.

### 3.2 Portefeuille crypto

Le portefeuille doit afficher :

- valeur totale estimée ;
- répartition par actif ;
- quantité détenue ;
- coût moyen si disponible ;
- valeur estimée en devise fiat choisie ;
- gain/perte indicatif ;
- actifs disponibles, bloqués, en attente ou réservés ;
- historique des mouvements ;
- frais cumulés ;
- provenance de la custody ;
- statut de synchronisation partenaire.

Mansa ne doit jamais afficher un solde comme définitif lorsque la donnée partenaire est stale ou en cours de réconciliation.

### 3.3 Achat

Parcours cible :

1. sélectionner l’actif ;
2. saisir montant fiat ou quantité crypto ;
3. vérifier éligibilité, KYC, pays, limites et disponibilité ;
4. récupérer une cotation partenaire ;
5. calculer prix, spread, frais Mansa, frais partenaire, taxes et total ;
6. afficher un récapitulatif complet avec expiration de la quote ;
7. authentifier/confirmer selon politique ;
8. réserver les fonds fiat si nécessaire ;
9. exécuter chez le partenaire ;
10. mettre à jour ledger et portefeuille ;
11. générer reçu ;
12. réconcilier asynchronement.

Aucun achat ne doit être exécuté sur une quote expirée.

### 3.4 Vente

Le parcours de vente doit vérifier :

- solde disponible réel ;
- actifs éventuellement bloqués ;
- minimum de vente ;
- politique fiscale d’affichage ;
- limites et source des fonds ;
- quote de vente ;
- spread et frais ;
- destination des fonds fiat ;
- statut final après règlement.

Les fonds issus d’une vente peuvent être crédités vers le wallet fiat Mansa ou une destination autorisée selon l’architecture locale.

### 3.5 Conversion crypto-crypto

Lorsque le partenaire le permet :

- conversion d’un actif A vers actif B ;
- quote explicite ;
- frais séparés ;
- slippage maximum ;
- délai d’expiration ;
- vérification disponibilité/réseau ;
- résultat estimé puis final.

Le système doit distinguer un swap réellement exécuté d’une vente + achat réalisés en deux jambes.

### 3.6 Dépôt blockchain

Pour chaque actif/réseau activé :

- générer ou récupérer une adresse de dépôt ;
- afficher le réseau exact ;
- afficher QR code ;
- avertir sur les erreurs de réseau ;
- gérer memo/tag/destination tag lorsque nécessaire ;
- afficher minimum de dépôt ;
- afficher nombre de confirmations attendues ;
- suivre transaction détectée, en confirmation, créditée ou rejetée ;
- déclencher contrôles AML blockchain si activés.

Le système doit interdire l’affichage d’une adresse d’un réseau non autorisé.

### 3.7 Retrait blockchain

Le retrait doit être fortement sécurisé :

1. sélectionner actif et réseau ;
2. saisir adresse ;
3. valider format et checksum ;
4. analyser sanctions/risque d’adresse lorsque service disponible ;
5. saisir montant ;
6. calculer frais réseau estimés + frais Mansa + frais partenaire ;
7. contrôler limites, velocity, device risk et disponibilité ;
8. appliquer authentification forte selon politique ;
9. passer éventuellement en revue manuelle ;
10. soumettre au partenaire custody ;
11. conserver identifiant partenaire et txid lorsque disponible ;
12. suivre confirmations ;
13. finaliser et réconcilier.

Les retraits doivent pouvoir être suspendus par actif, réseau, pays, compte ou globalement.

### 3.8 Transferts internes Mansa

Si le modèle partenaire le permet, Mansa peut proposer un transfert crypto interne entre utilisateurs Mansa sans émission on-chain immédiate.

Le système doit alors :

- vérifier que les deux utilisateurs sont éligibles ;
- appliquer limites et conformité ;
- enregistrer un mouvement ledger atomique ;
- ne jamais présenter le mouvement comme transaction blockchain s’il n’y en a pas ;
- distinguer frais internes des frais réseau.

### 3.9 Stablecoins

Les stablecoins sont traités comme une catégorie spécifique avec :

- liste blanche des actifs autorisés ;
- liste blanche des réseaux ;
- affichage de l’émetteur ;
- avertissement sur risque de depeg ;
- politique pays ;
- plafonds dédiés ;
- règles de conversion fiat/stablecoin ;
- suivi de risque de contrepartie.

Ils peuvent être totalement désactivés dans certaines juridictions.

### 3.10 Alertes et notifications

Notifications possibles :

- prix atteint ;
- achat/vente exécuté ;
- dépôt détecté ;
- dépôt crédité ;
- retrait demandé ;
- retrait approuvé/rejeté ;
- transaction blockchain confirmée ;
- réseau suspendu ;
- limite proche ;
- document KYC requis ;
- variation de frais ;
- incident partenaire.

Les notifications ne doivent jamais contenir de secret, seed phrase, clé privée ni information complète d’adresse sensible si cela n’est pas nécessaire.

## 4. Statuts et machines d’état

### 4.1 Ordre crypto

`DRAFT -> QUOTED -> PENDING_CONFIRMATION -> FUNDS_RESERVED -> SUBMITTED -> PARTIALLY_FILLED | FILLED | FAILED | EXPIRED | CANCELLED -> SETTLED -> RECONCILED`

Les transitions impossibles doivent être rejetées côté backend.

### 4.2 Dépôt

`ADDRESS_ISSUED -> DETECTED -> CONFIRMING -> AML_REVIEW? -> CREDIT_PENDING -> CREDITED -> RECONCILED`

Branches d’échec : `REJECTED`, `UNSUPPORTED_ASSET`, `UNSUPPORTED_NETWORK`, `MANUAL_REVIEW`.

### 4.3 Retrait

`DRAFT -> VALIDATING -> COMPLIANCE_CHECK -> PENDING_AUTH -> PENDING_REVIEW? -> APPROVED -> SUBMITTED -> BROADCAST -> CONFIRMING -> COMPLETED -> RECONCILED`

Branches : `REJECTED`, `FAILED`, `CANCELLED`, `BLOCKED`, `EXPIRED`.

## 5. Modèle de données cible

### 5.1 CryptoAsset

- id
- symbol
- name
- assetType: `NATIVE | TOKEN | STABLECOIN | OTHER`
- decimals
- status
- iconUrl
- riskCategory
- metadataJson
- createdAt
- updatedAt

### 5.2 CryptoNetwork

- id
- code
- name
- chainType
- confirmationsRequired
- supportsMemo
- status
- explorerBaseUrlTemplate nullable

### 5.3 CryptoAssetNetwork

- id
- assetId
- networkId
- contractAddress nullable
- depositsEnabled
- withdrawalsEnabled
- minDeposit
- minWithdrawal
- withdrawalPrecision
- partnerMapping

### 5.4 CryptoProvider

- id
- nameInternal
- providerType: `EXCHANGE | BROKER | CUSTODIAN | MARKET_DATA | BLOCKCHAIN_ANALYTICS | OTHER`
- status
- supportedCountries
- capabilities
- configurationReference

Aucun secret n’est stocké dans ce modèle documentaire ; les secrets sont gérés par le système de secrets de l’environnement.

### 5.5 CryptoAccount

- id
- userId
- countryCode
- providerId
- externalAccountRef
- custodyMode: `PARTNER_CUSTODY | MANSA_CUSTODY_FUTURE | SELF_CUSTODY_LINK | READ_ONLY`
- status
- openedAt
- restrictedAt nullable

### 5.6 CryptoBalance

- cryptoAccountId
- assetId
- available
- locked
- pending
- total
- providerReportedAt
- reconciledAt

### 5.7 CryptoOrder

- id
- userId
- providerId
- side: `BUY | SELL | SWAP`
- baseAssetId
- quoteAssetOrCurrency
- requestedAmount
- requestedQuantity nullable
- quotedPrice
- quotedFees
- totalAmount
- quoteExpiresAt
- status
- externalOrderRef
- createdAt
- executedAt
- settledAt

### 5.8 CryptoTransfer

- id
- type: `DEPOSIT | WITHDRAWAL | INTERNAL`
- userId
- assetId
- networkId nullable
- amount
- destinationAddressMasked nullable
- memoMasked nullable
- txid nullable
- status
- riskDecisionId nullable
- externalTransferRef
- confirmations
- createdAt
- completedAt

### 5.9 CryptoAddress

- id
- cryptoAccountId
- assetId
- networkId
- addressEncrypted
- displayAddressMasked
- memoEncrypted nullable
- status
- issuedByProvider
- createdAt

### 5.10 MarketPriceSnapshot

- assetId
- quoteCurrency
- source
- price
- bid nullable
- ask nullable
- timestamp
- freshnessStatus

### 5.11 CryptoComplianceDecision

- id
- userId
- operationId
- decision: `ALLOW | REVIEW | BLOCK`
- reasons
- screeningProviderRef nullable
- sanctionsCheckStatus
- blockchainRiskScore nullable
- sourceOfFundsStatus nullable
- createdAt

### 5.12 CryptoFeeSnapshot

Snapshot immuable des frais appliqués à une opération :

- pricingRuleVersionId
- MansaFee
- providerFee
- networkFee
- taxes
- spreadDisclosure
- currency
- totalFees
- calculatedAt

## 6. Ledger et comptabilité

Toute opération doit générer des écritures ledger équilibrées.

Exemples de comptes techniques :

- `USER_FIAT_AVAILABLE`
- `USER_FIAT_RESERVED`
- `USER_CRYPTO_AVAILABLE`
- `USER_CRYPTO_PENDING`
- `PARTNER_SETTLEMENT_RECEIVABLE`
- `PARTNER_SETTLEMENT_PAYABLE`
- `MANSA_FEE_REVENUE`
- `PARTNER_FEE_PAYABLE`
- `NETWORK_FEE_PAYABLE`
- `TAX_PAYABLE`

Les quantités crypto doivent utiliser des types décimaux haute précision et jamais des flottants binaires.

Le ledger ne doit pas dépendre uniquement d’un webhook partenaire pour considérer une opération comme finale.

## 7. Pricing & Commission Engine

Le module crypto doit consommer le moteur central de tarification Mansa.

Les règles doivent permettre :

- frais fixe ;
- pourcentage ;
- fixe + pourcentage ;
- minimum ;
- maximum ;
- paliers ;
- gratuité ;
- quota d’opérations gratuites ;
- promotions ;
- pays ;
- devise ;
- actif ;
- réseau ;
- canal ;
- type utilisateur ;
- segment client ;
- niveau KYC ;
- partenaire ;
- volume ;
- montant ;
- commission Mansa ;
- commission agent si un canal agent est autorisé ;
- commission commerçant si pertinent ;
- commission partenaire ;
- commission apporteur ;
- taxes séparées ;
- date d’effet ;
- date de fin.

### 7.1 Frais réseau

Les frais réseau sont séparés des frais Mansa.

Ils peuvent être :

- pass-through réel ;
- estimation puis ajustement ;
- frais partenaire ;
- montant sponsorisé par Mansa dans une promotion.

L’interface doit expliquer clairement la différence entre frais réseau blockchain, frais partenaire et frais Mansa.

### 7.2 Versioning

Chaque quote référence une version de règle de pricing.

Après confirmation, l’opération conserve un snapshot immuable des frais réellement appliqués même si l’administration modifie la tarification plus tard.

### 7.3 Gouvernance tarifaire

Workflow :

`DRAFT -> SIMULATED -> PENDING_APPROVAL -> SCHEDULED -> ACTIVE -> EXPIRED | REVOKED`

Les changements sensibles nécessitent approbation selon séparation des rôles.

## 8. RBAC / ABAC

### 8.1 Rôles principaux

- `CRYPTO_VIEWER`
- `CRYPTO_USER`
- `CRYPTO_SUPPORT`
- `CRYPTO_OPERATIONS`
- `CRYPTO_COMPLIANCE_ANALYST`
- `CRYPTO_COMPLIANCE_MANAGER`
- `CRYPTO_TREASURY`
- `CRYPTO_PRICING_ADMIN`
- `CRYPTO_PRODUCT_ADMIN`
- `CRYPTO_AUDITOR`
- `SUPER_ADMIN`

### 8.2 Attributs ABAC

Décisions basées sur :

- pays ;
- résidence ;
- nationalité si réglementairement nécessaire ;
- niveau KYC ;
- âge minimum ;
- type de compte ;
- score risque ;
- actif ;
- réseau ;
- montant ;
- volume période ;
- device trust ;
- statut sanctions/PEP ;
- source des fonds ;
- partenaire disponible ;
- statut incident ;
- heure/canal si politique spécifique.

## 9. API cible

Préfixe : `/v1/crypto`

### 9.1 Public authentifié

- `GET /assets`
- `GET /assets/:assetId`
- `GET /prices`
- `GET /portfolio`
- `GET /balances`
- `POST /quotes`
- `POST /orders`
- `GET /orders/:id`
- `GET /orders`
- `GET /deposit-addresses`
- `POST /deposit-addresses`
- `GET /deposits`
- `POST /withdrawals/quote`
- `POST /withdrawals`
- `GET /withdrawals/:id`
- `POST /internal-transfers`
- `GET /transactions`
- `POST /alerts`
- `DELETE /alerts/:id`

### 9.2 Administration

- `GET /admin/assets`
- `PATCH /admin/assets/:id`
- `GET /admin/networks`
- `PATCH /admin/networks/:id`
- `GET /admin/providers`
- `PATCH /admin/providers/:id`
- `GET /admin/operations`
- `POST /admin/withdrawals/:id/approve`
- `POST /admin/withdrawals/:id/reject`
- `POST /admin/accounts/:id/restrict`
- `POST /admin/accounts/:id/unrestrict`
- `POST /admin/feature-flags`
- `GET /admin/reconciliation`

Toutes les mutations doivent supporter idempotency key lorsque pertinent.

## 10. Webhooks partenaires

Événements normalisés :

- `crypto.order.accepted`
- `crypto.order.filled`
- `crypto.order.failed`
- `crypto.deposit.detected`
- `crypto.deposit.confirmed`
- `crypto.withdrawal.broadcast`
- `crypto.withdrawal.confirmed`
- `crypto.withdrawal.failed`
- `crypto.account.restricted`
- `crypto.network.suspended`

Exigences :

- signature vérifiée ;
- anti-replay ;
- timestamp ;
- stockage du payload brut chiffré ou minimisé selon politique ;
- parsing versionné ;
- idempotence ;
- dead-letter queue ;
- retries exponentiels ;
- monitoring.

## 11. Feature flags

Flags minimum :

- `crypto.enabled`
- `crypto.market_data.enabled`
- `crypto.buy.enabled`
- `crypto.sell.enabled`
- `crypto.swap.enabled`
- `crypto.deposits.enabled`
- `crypto.withdrawals.enabled`
- `crypto.internal_transfers.enabled`
- `crypto.stablecoins.enabled`
- `crypto.price_alerts.enabled`
- `crypto.blockchain_screening.enabled`
- `crypto.manual_review.enabled`

Les flags sont surchargeables par pays, partenaire, actif, réseau, environnement et segment.

## 12. Administration

Le portail Admin doit permettre :

- activer/désactiver le module par pays ;
- activer/désactiver un actif ;
- activer/désactiver un réseau ;
- configurer capacités par partenaire ;
- définir limites ;
- configurer seuils de revue ;
- consulter opérations ;
- rechercher par utilisateur, txid, ordre, partenaire ;
- voir état de réconciliation ;
- suspendre les retraits ;
- forcer une revue manuelle sans modifier les soldes ;
- gérer alertes opérationnelles ;
- consulter frais et revenus ;
- simuler règles tarifaires ;
- programmer une tarification ;
- consulter historique des versions ;
- exporter rapports autorisés.

Toute action sensible doit afficher l’impact et demander une justification.

## 13. Sécurité

### 13.1 Secrets et clés

- aucune clé privée dans le code ;
- aucune seed phrase ;
- secrets via secret manager ;
- rotation ;
- séparation environnements ;
- scopes minimaux ;
- audit accès aux secrets.

### 13.2 Authentification forte

Exiger selon risque :

- biométrie locale liée à un secret serveur ;
- PIN applicatif ;
- OTP ou autre facteur ;
- step-up auth pour retrait, ajout d’adresse ou changement sécurité ;
- délai de refroidissement après changement d’appareil, mot de passe ou téléphone.

### 13.3 Adresses

- chiffrement au repos ;
- masquage dans logs/UI admin ;
- allowlist optionnelle ;
- délai de sécurité après ajout ;
- détection changement suspect ;
- blocage clipboard malware non garanti mais avertissement utilisateur et vérification visuelle obligatoire.

### 13.4 Anti-fraude

Signaux :

- nouveau device ;
- IP/pays incohérent ;
- vitesse anormale ;
- retraits successifs ;
- changement de profil récent ;
- montants fractionnés ;
- compte dormant soudain actif ;
- adresse à risque ;
- compte mule potentiel ;
- comportement bot ;
- prise de contrôle de compte.

Décisions : `ALLOW`, `STEP_UP`, `HOLD`, `MANUAL_REVIEW`, `BLOCK`.

## 14. Conformité

Le module doit pouvoir intégrer :

- KYC/KYB ;
- sanctions ;
- PEP ;
- AML transaction monitoring ;
- blockchain analytics ;
- Travel Rule lorsqu’applicable ;
- source des fonds ;
- source du patrimoine selon seuils ;
- déclarations réglementaires ;
- conservation légale ;
- géoblocage.

Les exigences varient par pays et doivent être encapsulées dans des politiques configurables, pas codées directement dans les parcours UI.

## 15. Multi-pays et multi-devises

Chaque juridiction définit :

- module autorisé ou non ;
- actifs autorisés ;
- réseaux autorisés ;
- partenaire principal/fallback ;
- devise fiat ;
- limites ;
- âge minimum ;
- niveau KYC ;
- produits disponibles ;
- disclosures ;
- taxes ;
- frais ;
- politique de retrait ;
- conservation des données.

Le même utilisateur peut avoir des règles différentes après changement de résidence ; les changements sensibles doivent être revus et historisés.

## 16. Réseau faible et hors ligne

Les opérations crypto financières ne sont **jamais finalisées hors ligne**.

En réseau faible :

- consultation possible avec cache clairement marqué comme non temps réel ;
- brouillon d’ordre local possible ;
- aucune quote n’est considérée valide sans serveur ;
- retrait ne part jamais sans validation serveur ;
- statut UI indique `En attente de connexion` ;
- reprise idempotente ;
- aucune double soumission.

Les données sensibles mises en cache doivent être minimisées et chiffrées.

## 17. Intégrations partenaires abstraites

Interfaces :

### CryptoTradingProvider

- `getAssets()`
- `getQuote()`
- `placeOrder()`
- `getOrder()`
- `cancelOrder()` si supporté

### CryptoCustodyProvider

- `createOrGetAccount()`
- `getBalances()`
- `getDepositAddress()`
- `requestWithdrawal()`
- `getTransfer()`

### CryptoMarketDataProvider

- `getSpotPrice()`
- `getCandles()`
- `getTicker()`

### BlockchainRiskProvider

- `screenAddress()`
- `screenTransaction()`
- `getRiskCase()`

Chaque adaptateur doit déclarer ses capabilities et limitations. Aucun code métier ne doit dépendre directement d’un fournisseur spécifique.

## 18. Réconciliation

Trois niveaux :

1. ledger interne Mansa ;
2. état partenaire ;
3. état blockchain lorsque pertinent.

Jobs :

- intraday ;
- fin de journée ;
- réconciliation à la demande ;
- backfill après incident.

Différences classées :

- timing ;
- fee mismatch ;
- quantity mismatch ;
- missing transaction ;
- duplicate transaction ;
- partner status mismatch ;
- blockchain confirmation mismatch.

Aucune correction manuelle de solde sans écriture compensatoire auditée.

## 19. Observabilité

Métriques :

- taux de quote ;
- taux d’acceptation ;
- ordre success/failure ;
- latence partenaire ;
- dépôts en attente ;
- retraits en attente ;
- confirmation time ;
- taux de revue manuelle ;
- taux de blocage fraude ;
- écarts de réconciliation ;
- revenus frais ;
- coût partenaire ;
- disponibilité par réseau.

Alertes critiques :

- double débit potentiel ;
- écart de ledger ;
- retraits anormalement élevés ;
- signature webhook invalide ;
- partenaire indisponible ;
- réseau suspendu ;
- prix stale ;
- explosion du taux d’échec.

## 20. Résilience

- timeouts stricts ;
- retries seulement pour opérations idempotentes ;
- circuit breaker ;
- provider fallback uniquement si l’ordre n’a pas été soumis ;
- outbox pattern ;
- queues ;
- idempotency keys ;
- verrouillage logique ;
- replay contrôlé ;
- reprise incident documentée ;
- disaster recovery testé.

Un timeout après soumission doit être traité comme **état inconnu à réconcilier**, jamais comme échec garanti.

## 21. Données et minimisation

Ne conserver que ce qui est nécessaire pour :

- exécution ;
- sécurité ;
- audit ;
- conformité ;
- support ;
- obligations légales.

Éviter de dupliquer les payloads partenaires. Les données sensibles sont chiffrées, masquées et soumises aux politiques de rétention Mansa.

L’utilisateur doit pouvoir exporter les données exportables avant suppression lorsqu’une suppression est autorisée, sans supprimer les éléments soumis à rétention légale.

## 22. Expérience utilisateur

Écrans principaux :

1. Accueil Crypto
2. Marchés
3. Fiche actif
4. Acheter
5. Vendre
6. Convertir
7. Portefeuille
8. Recevoir / Dépôt
9. Envoyer / Retrait
10. Historique
11. Alertes
12. Sécurité crypto
13. Informations et risques

Toujours afficher :

- actif ;
- réseau ;
- montant ;
- frais ;
- taux ;
- expiration de quote ;
- statut ;
- avertissement si irréversible.

## 23. Jini

Jini peut :

- expliquer un actif ;
- expliquer les frais ;
- expliquer un statut ;
- aider à naviguer ;
- résumer l’historique ;
- créer une alerte après confirmation utilisateur.

Jini ne doit pas :

- inventer un rendement ;
- garantir une hausse ;
- donner une recommandation personnalisée réglementée sans cadre approprié ;
- initier un retrait sans authentification et confirmation ;
- afficher une clé privée ou seed phrase.

Toute action Jini passe par les mêmes Skills, permissions, policies et audits que l’interface classique.

## 24. Tests

### 24.1 Fonctionnels

- achat réussi ;
- quote expirée ;
- vente partielle ;
- dépôt confirmé ;
- dépôt réseau non supporté ;
- retrait approuvé ;
- retrait bloqué ;
- transfert interne ;
- stablecoin désactivé ;
- pays non éligible ;
- limite dépassée ;
- KYC incomplet.

### 24.2 Sécurité

- replay webhook ;
- falsification signature ;
- IDOR ;
- élévation privilèges ;
- double soumission ;
- race condition ;
- modification adresse ;
- session volée ;
- secret leakage ;
- logs sensibles.

### 24.3 Pricing

- fixe ;
- pourcentage ;
- fixe + % ;
- min/max ;
- paliers ;
- promotion ;
- pays ;
- actif ;
- réseau ;
- taxe ;
- snapshot historique ;
- changement tarifaire programmé.

### 24.4 Résilience

- partenaire timeout avant soumission ;
- timeout après soumission ;
- webhook en retard ;
- webhook dupliqué ;
- panne market data ;
- panne custody ;
- blockchain congestion ;
- reprise après incident.

### 24.5 Performance

Objectifs à mesurer par environnement :

- consultation portefeuille ;
- génération quote ;
- ingestion webhook ;
- traitement de batch réconciliation ;
- montée en charge sur volatilité forte.

## 25. Ordre de développement recommandé

1. schéma données + contrats partagés ;
2. feature flags et politiques pays ;
3. providers abstraits ;
4. market data ;
5. portefeuille read-only ;
6. pricing crypto ;
7. quote engine ;
8. achat/vente ;
9. ledger et settlement ;
10. dépôts ;
11. retraits ;
12. conformité blockchain ;
13. administration ;
14. réconciliation ;
15. alertes ;
16. Jini Skills ;
17. tests sécurité/résilience ;
18. rollout pilote.

## 26. Critères d’acceptation

Le module est acceptable si :

- aucun actif/réseau indisponible n’est proposé ;
- toutes les opérations réglementées passent par un partenaire configuré ;
- chaque opération financière est idempotente ;
- chaque opération possède une trace ledger ;
- chaque frais est calculé par le moteur configurable ;
- le détail Mansa/partenaire/réseau/taxes est conservé ;
- les tarifs historiques restent immuables ;
- les retraits appliquent sécurité et conformité ;
- les webhooks sont signés, idempotents et auditables ;
- les soldes sont réconciliables ;
- les droits RBAC/ABAC empêchent les accès non autorisés ;
- le module peut être coupé instantanément par pays, actif ou réseau ;
- aucune donnée secrète crypto n’est stockée ou loggée en clair ;
- les parcours réseau faible ne peuvent pas provoquer un double ordre ;
- les tests fonctionnels, sécurité, pricing et résilience passent ;
- le comportement réel correspond aux capabilities contractuelles du partenaire.

## 27. Hors périmètre initial

À ne pas considérer comme disponible par défaut :

- staking ;
- lending ;
- leverage ;
- margin trading ;
- futures/options ;
- DeFi non custodiale ;
- NFT ;
- mixeurs ;
- privacy coins ;
- custody directe Mansa ;
- trading algorithmique utilisateur.

Ces fonctions nécessitent une analyse réglementaire, sécurité, risque et partenaire dédiée avant tout ajout.

## 28. Résultat attendu

Le module Crypto & Bitcoin avancé doit offrir une expérience cohérente avec le reste de Mansa tout en restant techniquement et juridiquement découplé des fournisseurs. Mansa contrôle l’expérience, les permissions, la tarification, la traçabilité, la conformité et le ledger ; les capacités réglementées réelles sont fournies uniquement par les partenaires autorisés dans les juridictions concernées.