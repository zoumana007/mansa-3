# 13 — Change & Multi-devises avancé

## 1. Objectif

Le module **Change & Multi-devises avancé** permet à MANSA de gérer plusieurs devises de manière cohérente, sécurisée, auditable et configurable dans les parcours Client, Commerce, Agent, Entreprise, État, API partenaires et Super Admin.

Le module doit couvrir la consultation de taux, la conversion entre soldes compatibles, l’estimation avant exécution, le verrouillage temporaire d’un taux lorsque le partenaire le permet, l’application de marges et frais configurables, la tenue de soldes par devise, le suivi comptable, la réconciliation, la gestion du risque de change et l’activation progressive par pays.

Le principe directeur est : **MANSA ne doit jamais supposer qu’une devise, une paire de change, un corridor, un partenaire FX, une capacité de conversion ou une licence réglementaire est disponible**. Toute capacité réelle doit être activée par configuration après validation juridique, contractuelle, opérationnelle et technique.

Le moteur multi-devises doit fonctionner comme une couche centrale réutilisable par tous les modules. Une même règle de devise, de précision monétaire, de taux, de spread, de frais, de limites et de disponibilité ne doit pas être recodée indépendamment dans chaque application.

---

## 2. Principes fondamentaux

1. **Aucun montant financier en flottant** : utiliser des entiers en unité mineure ou un type décimal exact contrôlé.
2. **Devise explicite partout** : aucun montant sans code devise ISO 4217 ou identifiant monétaire interne validé.
3. **Pas de conversion implicite** : un débit dans une devise ne doit jamais convertir automatiquement un autre solde sans règle métier et consentement explicites.
4. **Source de taux traçable** : chaque taux appliqué conserve sa source, son horodatage et sa version.
5. **Snapshot immuable à l’exécution** : une transaction historique conserve le taux, spread, frais, taxes et quote utilisés au moment de l’opération.
6. **Disponibilité par pays et partenaire** : une paire peut être visible dans un pays mais désactivée dans un autre.
7. **Séparation taux marché / taux client** : le taux de référence et le taux présenté au client sont distingués.
8. **Transparence** : avant confirmation, le client voit le montant envoyé, le montant reçu estimé, le taux, les frais et la devise finale.
9. **Réconciliation obligatoire** pour tout flux impliquant une contrepartie ou un partenaire externe.
10. **Mode dégradé sûr** : en cas d’absence de taux fiable ou de partenaire indisponible, aucune conversion financière réelle ne doit être inventée ou exécutée sur un taux obsolète au-delà des limites configurées.

---

## 3. Périmètre fonctionnel

Le module couvre notamment :

- portefeuilles et sous-soldes multi-devises ;
- affichage de devises activées ;
- devise principale utilisateur ;
- devise de présentation ;
- taux de référence ;
- taux client ;
- spreads ;
- quotes de change ;
- durée de validité d’un quote ;
- conversions internes ;
- conversions via partenaire ;
- corridors de change ;
- paires autorisées ;
- minimums et maximums ;
- arrondis ;
- frais et commissions ;
- taxes éventuelles ;
- limites quotidiennes/mensuelles ;
- règles KYC/KYB ;
- contrôles AML/fraude ;
- ledger multi-devises ;
- comptes de clearing ;
- positions de trésorerie ;
- réconciliation ;
- rapports ;
- API et webhooks ;
- feature flags ;
- administration ;
- alertes ;
- observabilité ;
- résilience ;
- simulation et sandbox.

Hors périmètre par défaut : trading spéculatif propriétaire de devises, promesse de taux garanti sans fournisseur de liquidité, exposition utilisateur à un produit dérivé FX, marge/leverage, ou conservation réglementée d’une devise non autorisée.

---

## 4. Devises et unités monétaires

### 4.1 CurrencyDefinition

Modèle recommandé `CurrencyDefinition` :

- `id` ;
- `code` ;
- `name` ;
- `symbol` ;
- `minorUnit` ;
- `status` ;
- `type` : `FIAT`, `INTERNAL_UNIT`, autre type uniquement si explicitement autorisé ;
- `countriesEnabled[]` ;
- `displayPrecision` ;
- `settlementPrecision` ;
- `cashRoundingRule` éventuelle ;
- `isWalletHoldable` ;
- `isConvertible` ;
- `createdAt` ;
- `updatedAt`.

Les monnaies fiat doivent suivre ISO 4217 lorsque disponible. Les codes internes éventuels ne doivent jamais être présentés comme devises bancaires officielles.

### 4.2 Devise principale

Chaque utilisateur ou organisation peut avoir :

- une devise principale de compte ;
- une devise d’affichage préférée ;
- plusieurs soldes en devises différentes si le produit et le pays le permettent.

La devise d’affichage ne modifie jamais le ledger. Une conversion d’affichage est informative, avec taux et timestamp visibles si nécessaire.

---

## 5. Portefeuille multi-devises

Un wallet MANSA peut exposer plusieurs `CurrencyBalance` séparés.

### 5.1 CurrencyBalance

Champs recommandés :

- `id` ;
- `walletId` ;
- `currencyCode` ;
- `availableMinor` ;
- `pendingMinor` ;
- `reservedMinor` ;
- `blockedMinor` ;
- `ledgerAccountId` ;
- `status` ;
- `createdAt` ;
- `updatedAt`.

Invariant :

`ledger balance = available + pending + reserved + blocked` selon les conventions de comptabilisation définies.

Les composantes de solde doivent être dérivables du ledger ou contrôlées par un mécanisme de cohérence vérifiable.

### 5.2 Ouverture d’un sous-solde

L’ouverture d’un solde en devise peut dépendre de :

- pays de résidence ;
- niveau KYC ;
- type de client ;
- statut du partenaire ;
- disponibilité réglementaire ;
- contrat produit ;
- plafonds ;
- feature flag.

États possibles : `REQUESTED`, `ACTIVE`, `RESTRICTED`, `FROZEN`, `CLOSING`, `CLOSED`.

---

## 6. Paires de change et corridors

### 6.1 FxPair

Exemple : `EUR/XOF`.

Champs :

- `baseCurrency` ;
- `quoteCurrency` ;
- `status` ;
- `conversionMode` : `INTERNAL`, `PARTNER`, `HYBRID`, `DISPLAY_ONLY` ;
- `minAmountMinor` ;
- `maxAmountMinor` ;
- `countryRules[]` ;
- `partnerRoutingPolicyId` ;
- `quoteTtlSeconds` ;
- `staleRateThresholdSeconds` ;
- `roundingPolicyId` ;
- `pricingPolicyId` ;
- `compliancePolicyId`.

### 6.2 Corridor

Un corridor peut représenter plus que la paire. Exemple : un transfert `France EUR -> Mali XOF` peut nécessiter un ensemble spécifique de règles.

`FxCorridor` :

- pays source ;
- pays destination ;
- devise source ;
- devise destination ;
- canal ;
- type d’utilisateur ;
- partenaire ;
- limites ;
- conformité ;
- horaires éventuels ;
- settlement mode ;
- pricing policy ;
- statut.

Le Super Admin peut activer ou désactiver un corridor sans déployer de code.

---

## 7. Sources de taux

MANSA utilise une interface abstraite `FxRateProvider`.

Fonctions minimales :

- `getIndicativeRate(pair)` ;
- `getExecutableQuote(request)` ;
- `getQuoteStatus(quoteId)` ;
- `executeQuote(quoteId, instruction)` si le partenaire permet une exécution liée ;
- `cancelQuote(quoteId)` si supporté ;
- `health()`.

Types de sources possibles :

- partenaire bancaire ;
- fournisseur FX ;
- source institutionnelle ou de marché pour indication ;
- taux interne contractuel ;
- taux fixe officiel lorsque juridiquement applicable ;
- mock provider pour sandbox.

Aucun nom de fournisseur ne doit être codé comme dépendance obligatoire. Les adaptateurs sont interchangeables.

### 7.1 Hiérarchie des taux

MANSA distingue :

1. `referenceRate` : taux de référence informatif ;
2. `providerRate` : taux fourni/exécutable par le partenaire ;
3. `customerRate` : taux final présenté au client après spread éventuel ;
4. `effectiveRate` : taux réellement appliqué et stocké dans la transaction.

---

## 8. Quote de change

Toute conversion financière passe par un `FxQuote` explicite.

Champs :

- `id` ;
- `customerId` ou `organizationId` ;
- `sourceCurrency` ;
- `targetCurrency` ;
- `sourceAmountMinor` ;
- `targetAmountMinor` ;
- `referenceRate` ;
- `providerRate` ;
- `customerRate` ;
- `spreadBps` ;
- `feeSnapshot` ;
- `taxSnapshot` ;
- `providerId` ;
- `providerQuoteId` ;
- `createdAt` ;
- `expiresAt` ;
- `status` ;
- `countryContext` ;
- `pricingVersionId` ;
- `rateSourceTimestamp` ;
- `idempotencyKey`.

États : `CREATED`, `PRICED`, `VALID`, `EXPIRED`, `ACCEPTED`, `EXECUTING`, `EXECUTED`, `FAILED`, `CANCELLED`.

Un quote expiré ne peut pas être exécuté. Une nouvelle estimation doit être créée.

---

## 9. Parcours Client — conversion

### 9.1 Consultation

L’utilisateur sélectionne :

- devise source ;
- devise destination ;
- montant envoyé ou montant souhaité à recevoir.

MANSA vérifie :

- paire/corridor disponible ;
- compte devise actif ;
- KYC suffisant ;
- limites ;
- sanctions/AML ;
- solde disponible ;
- disponibilité partenaire ;
- taux non obsolète.

### 9.2 Prévisualisation

L’écran doit présenter avant confirmation :

- montant débité ;
- devise source ;
- taux appliqué ;
- durée de validité ;
- frais MANSA ;
- frais partenaire si refacturés ;
- taxes ;
- montant reçu ;
- devise destination ;
- éventuel écart entre taux de référence et taux client lorsque requis par la politique produit ;
- date/heure du quote.

### 9.3 Confirmation

La confirmation crée une intention idempotente.

Le système :

1. revalide le quote ;
2. réserve le montant source ;
3. exécute via moteur interne ou partenaire ;
4. écrit les écritures ledger ;
5. crédite le solde destination ;
6. enregistre les frais/commissions ;
7. déclenche la réconciliation ;
8. envoie reçu et événement webhook.

Aucun double débit en cas de retry réseau.

---

## 10. Conversion interne et conversion partenaire

### 10.1 Mode INTERNAL

Utilisable uniquement si MANSA dispose réellement des comptes, liquidités, permissions et règles nécessaires.

Le ledger réalise un échange équilibré entre :

- compte client source ;
- compte de clearing source ;
- compte de clearing destination ;
- compte client destination ;
- comptes de frais/commissions ;
- comptes de taxe le cas échéant.

### 10.2 Mode PARTNER

MANSA réserve le montant, transmet une instruction au partenaire, attend le résultat puis finalise le ledger selon un state machine résilient.

Aucune réponse timeout ne doit être interprétée comme échec définitif sans interrogation de statut ou réconciliation.

### 10.3 Mode HYBRID

Le routeur peut choisir entre plusieurs partenaires ou liquidités internes selon politiques :

- disponibilité ;
- coût ;
- corridor ;
- limite ;
- devise ;
- SLA ;
- risque ;
- contrat ;
- qualité du taux.

La politique de routage est administrable et auditable.

---

## 11. Ledger multi-devises

Le ledger doit rester en partie double.

Une écriture ne mélange jamais deux devises dans un même montant. Une conversion est représentée par plusieurs lignes équilibrées par devise avec un identifiant commun `fxTransactionId`.

Exemple conceptuel :

- débit client EUR ;
- crédit clearing EUR ;
- débit clearing XOF ;
- crédit client XOF ;
- écritures de frais séparées.

Les métadonnées conservent :

- quote ;
- rate snapshot ;
- pricing snapshot ;
- partenaire ;
- corridor ;
- référence externe ;
- request/correlation ID ;
- initiateur.

---

## 12. États d’une conversion

`FxConversion` :

- `CREATED` ;
- `QUOTED` ;
- `AWAITING_CONFIRMATION` ;
- `FUNDS_RESERVED` ;
- `PROCESSING` ;
- `PARTNER_PENDING` ;
- `SETTLED` ;
- `FAILED` ;
- `REVERSED` ;
- `CANCELLED` ;
- `MANUAL_REVIEW`.

Transitions strictes et idempotentes.

Un `SETTLED` ne doit pas redevenir `PROCESSING`.

Une correction comptable se fait par écriture de reversal/adjustment, jamais par suppression d’une écriture historique.

---

## 13. Arrondis et précision

Chaque devise possède une précision officielle et une politique d’affichage.

Règles obligatoires :

- calculs en précision supérieure au montant affiché ;
- arrondi uniquement aux points définis ;
- stratégie déterministe (`HALF_UP`, `HALF_EVEN`, `DOWN`, etc.) configurée par produit si nécessaire ;
- conservation du montant avant arrondi pour audit ;
- traitement explicite des reliquats d’arrondi ;
- aucun centime/unité mineure fictive dans une devise ne les supportant pas.

Un compte technique `ROUNDING_ADJUSTMENT` peut enregistrer les écarts lorsque nécessaire.

---

## 14. Pricing & Commission Engine

Le module utilise obligatoirement le moteur de tarification central MANSA.

Pour une conversion, l’administration peut configurer :

- frais fixes ;
- pourcentage ;
- fixe + pourcentage ;
- minimum ;
- maximum ;
- paliers ;
- gratuité ;
- quota d’opérations gratuites ;
- promotions ;
- spread en points de base ;
- marge spécifique par paire ;
- marge par corridor ;
- marge par partenaire ;
- pays ;
- devise ;
- canal ;
- client particulier/entreprise ;
- niveau KYC ;
- segment ;
- volume cumulé ;
- commission MANSA ;
- commission agent ;
- commission commerçant ;
- commission partenaire ;
- commission apporteur ;
- taxes séparées ;
- date d’effet ;
- date de fin.

### 14.1 Versioning

Chaque changement produit une version immuable :

`DRAFT -> SIMULATED -> PENDING_APPROVAL -> SCHEDULED -> ACTIVE -> RETIRED`.

Une conversion stocke :

- `pricingVersionId` ;
- détail des composants ;
- quote ;
- taux ;
- spread ;
- taxes ;
- bénéficiaires de commission.

Un changement futur ne modifie jamais une transaction historique.

### 14.2 Simulation avant publication

Le Super Admin doit pouvoir tester une grille sur :

- montants types ;
- différentes paires ;
- différents pays ;
- segments clients ;
- partenaires ;
- volumes.

La simulation affiche :

- coût client ;
- montant reçu ;
- marge brute estimée ;
- commission partenaire ;
- commission réseau ;
- taxes ;
- revenu MANSA ;
- comparaison avec version active.

Les changements sensibles peuvent exiger une double approbation.

---

## 15. Taxes et obligations réglementaires

Les taxes ne sont jamais confondues avec les frais MANSA.

`TaxComponent` contient :

- type ;
- juridiction ;
- base taxable ;
- taux/montant ;
- devise ;
- bénéficiaire ;
- règle/version ;
- montant calculé.

Les règles fiscales et de change varient selon le pays. Elles doivent être configurées et validées juridiquement avant activation.

MANSA ne doit pas inférer automatiquement une taxe sur la seule base du pays sans règle approuvée.

---

## 16. Limites et contrôles

Le moteur de limites peut appliquer :

- par transaction ;
- par jour ;
- par semaine ;
- par mois ;
- par paire ;
- par corridor ;
- par devise ;
- par utilisateur ;
- par organisation ;
- par niveau KYC/KYB ;
- par appareil ;
- par canal ;
- par partenaire.

Les limites peuvent être :

- réglementaires ;
- contractuelles ;
- produit ;
- anti-fraude ;
- risque trésorerie.

Une limite réglementaire ne peut pas être outrepassée par un admin commercial.

---

## 17. KYC, AML, sanctions et fraude

Contrôles avant ou après quote selon risque :

- statut KYC/KYB ;
- sanctions ;
- PEP si requis ;
- source/destination ;
- vélocité ;
- montant inhabituel ;
- structuration ;
- nouveaux appareils ;
- changements de pays ;
- incohérences profil/activité ;
- multiplicité de comptes ;
- comportements de conversion circulaire ;
- arbitrage abusif contre taux obsolète ;
- exploitation de promotions ;
- tentatives répétées sur quote expiré.

Actions :

- autoriser ;
- demander authentification renforcée ;
- demander justificatif ;
- mettre en attente ;
- revue manuelle ;
- refuser ;
- restreindre compte ;
- signaler au système de conformité selon règles applicables.

Les motifs internes sensibles ne doivent pas être révélés intégralement au client.

---

## 18. Trésorerie et exposition FX

Le système suit les positions par devise et partenaire.

`TreasuryPosition` :

- devise ;
- solde disponible ;
- solde engagé ;
- exposition nette ;
- limite interne ;
- partenaire ;
- lastReconciledAt ;
- statut.

Alertes :

- liquidité basse ;
- exposition excessive ;
- taux anormal ;
- partenaire indisponible ;
- réconciliation en écart ;
- quote exécuté non confirmé ;
- settlement en retard.

MANSA peut désactiver temporairement une paire ou réduire les limites si la liquidité ou le risque l’exige.

---

## 19. Réconciliation

Réconciliation à plusieurs niveaux :

1. ledger MANSA ;
2. compte/solde partenaire ;
3. exécutions FX ;
4. frais partenaire ;
5. commissions ;
6. settlement bancaire ;
7. positions trésorerie.

`ReconciliationItem` :

- date ;
- partenaire ;
- devise ;
- référence interne ;
- référence externe ;
- montant interne ;
- montant externe ;
- taux ;
- différence ;
- statut ;
- motif ;
- résolution ;
- approbateur.

États : `MATCHED`, `MISSING_INTERNAL`, `MISSING_EXTERNAL`, `AMOUNT_MISMATCH`, `RATE_MISMATCH`, `FEE_MISMATCH`, `PENDING`, `RESOLVED`.

Aucun écart ne doit être corrigé en modifiant silencieusement l’historique.

---

## 20. Partenaires et adaptateurs

Interface `FxProviderAdapter` derrière une couche d’orchestration.

Le partenaire peut fournir :

- prix indicatif ;
- quote exécutable ;
- conversion ;
- settlement ;
- reporting ;
- balance ;
- webhook ;
- fichier de réconciliation.

Le système doit gérer :

- capabilities par partenaire ;
- timeout ;
- retry contrôlé ;
- circuit breaker ;
- idempotence ;
- statut asynchrone ;
- mapping d’erreurs ;
- rotation de credentials ;
- sandbox ;
- SLA ;
- maintenance.

Les credentials sont dans un gestionnaire de secrets et jamais dans Git.

---

## 21. Multi-pays

`CountryFxPolicy` configure :

- devises visibles ;
- devises holdables ;
- paires autorisées ;
- corridors ;
- partenaires ;
- limites ;
- KYC requis ;
- taxes ;
- frais ;
- règles réglementaires ;
- disponibilité particuliers/entreprises ;
- horaires éventuels ;
- exigences de justificatifs ;
- feature flags.

Un lancement au Mali ne doit pas imposer les mêmes règles à un lancement futur dans un autre pays.

---

## 22. Expérience utilisateur

### 22.1 Écran portefeuille

Afficher séparément :

- solde par devise ;
- valeur indicative dans devise préférée ;
- variation du taux si disponible ;
- bouton convertir si autorisé ;
- historique.

La valeur totale convertie est indicative et horodatée.

### 22.2 Convertisseur

Le convertisseur doit permettre d’éditer soit :

- « Vous envoyez » ;
- soit « Le bénéficiaire reçoit ».

Le calcul inverse doit respecter précision, frais et arrondis.

### 22.3 Reçu

Le reçu de conversion comprend :

- ID transaction ;
- date/heure ;
- montant source ;
- taux ;
- frais ;
- taxes ;
- montant destination ;
- statut ;
- référence ;
- canal.

---

## 23. Commerce, Entreprise, Agent et État

### Commerce

- devise de règlement principale ;
- acceptation multi-devise si activée ;
- conversion explicite ;
- reporting de ventes par devise ;
- settlement selon contrat.

### Entreprise

- soldes multi-devises ;
- politiques de dépenses ;
- approbations de conversion ;
- limites par rôle ;
- exports comptables ;
- délégation contrôlée.

### Agent

Un agent ne peut proposer des opérations de change que si :

- le produit est autorisé ;
- son rôle le permet ;
- son point de service est activé ;
- les limites et liquidités sont suffisantes.

Toute rémunération agent est issue du Pricing & Commission Engine.

### État

Les paiements publics restent dans la devise attendue par le service public sauf configuration contractuelle explicite. MANSA ne convertit pas implicitement un paiement fiscal sans parcours et règle validés.

---

## 24. RBAC / ABAC

Rôles recommandés :

- `CUSTOMER` ;
- `BUSINESS_USER` ;
- `BUSINESS_APPROVER` ;
- `AGENT_OPERATOR` ;
- `FX_OPERATIONS` ;
- `TREASURY_ANALYST` ;
- `TREASURY_MANAGER` ;
- `FX_PRICING_ADMIN` ;
- `COMPLIANCE_ANALYST` ;
- `RISK_MANAGER` ;
- `RECONCILIATION_OPERATOR` ;
- `AUDITOR` ;
- `SUPER_ADMIN`.

Attributs ABAC :

- pays ;
- devise ;
- paire ;
- corridor ;
- montant ;
- segment ;
- niveau KYC ;
- partenaire ;
- canal ;
- risque ;
- statut ;
- heure ;
- device trust ;
- organisation.

Exemple : un opérateur support peut lire un quote mais ne peut pas modifier un taux actif.

Les changements de grille tarifaire, partenaire principal, limite trésorerie ou paire critique peuvent exiger un maker-checker.

---

## 25. Administration

Le Super Admin dispose d’écrans dédiés pour :

- devises ;
- paires ;
- corridors ;
- fournisseurs ;
- routage ;
- sources de taux ;
- spreads ;
- pricing ;
- taxes ;
- limites ;
- liquidité ;
- positions ;
- quotes ;
- conversions ;
- réconciliation ;
- incidents ;
- feature flags ;
- audit.

Actions sensibles :

- activer/désactiver devise ;
- activer/désactiver paire ;
- changer source de taux ;
- changer spread ;
- modifier limites ;
- suspendre partenaire ;
- forcer revue ;
- programmer nouvelle grille.

Chaque action conserve initiateur, ancien état, nouvel état, motif, approbateur éventuel et timestamp.

---

## 26. API internes

Exemples de routes :

- `GET /v1/fx/currencies` ;
- `GET /v1/fx/pairs` ;
- `POST /v1/fx/quotes` ;
- `GET /v1/fx/quotes/:id` ;
- `POST /v1/fx/quotes/:id/accept` ;
- `GET /v1/fx/conversions/:id` ;
- `GET /v1/wallets/:id/balances` ;
- `POST /v1/admin/fx/pairs` ;
- `PATCH /v1/admin/fx/pairs/:id` ;
- `POST /v1/admin/fx/pricing/simulate` ;
- `POST /v1/admin/fx/pricing/versions` ;
- `POST /v1/admin/fx/pricing/:id/approve` ;
- `GET /v1/admin/fx/positions` ;
- `GET /v1/admin/fx/reconciliation`.

Les routes financières utilisent idempotency keys, correlation IDs et contrôle de version.

---

## 27. Événements et webhooks

Événements internes :

- `fx.quote.created` ;
- `fx.quote.expired` ;
- `fx.quote.accepted` ;
- `fx.conversion.processing` ;
- `fx.conversion.settled` ;
- `fx.conversion.failed` ;
- `fx.conversion.reversed` ;
- `fx.rate.stale` ;
- `fx.provider.degraded` ;
- `fx.limit.reached` ;
- `fx.reconciliation.mismatch` ;
- `fx.pricing.activated`.

Webhooks externes : seulement pour partenaires/clients autorisés, signés, replay-protected, versionnés, retryables et sans PII inutile.

---

## 28. Feature flags

Exemples :

- `fx.enabled` ;
- `fx.multi_currency_wallet.enabled` ;
- `fx.pair.EUR_XOF.enabled` ;
- `fx.customer_conversion.enabled` ;
- `fx.business_conversion.enabled` ;
- `fx.agent_conversion.enabled` ;
- `fx.rate_lock.enabled` ;
- `fx.partner_routing.enabled` ;
- `fx.offline_display.enabled`.

Scope possible : global, pays, tenant, segment, application, partenaire.

Le flag ne remplace jamais les contrôles réglementaires.

---

## 29. Réseau faible et hors ligne

### Autorisé hors ligne

- consultation du dernier taux indicatif avec mention claire `hors ligne` et timestamp ;
- consultation de l’historique local non sensible ;
- préparation d’une demande non financière.

### Interdit hors ligne par défaut

- exécuter réellement une conversion sur un taux non confirmé ;
- débiter/créditer des wallets sans coordination serveur ;
- promettre un taux verrouillé ;
- modifier grille de prix ou limites.

Une intention préparée hors ligne peut être envoyée au retour réseau, mais le serveur doit générer un nouveau quote et demander confirmation si les valeurs financières ont changé.

---

## 30. Sécurité

Exigences :

- TLS moderne ;
- chiffrement au repos ;
- gestionnaire de secrets ;
- rotation de credentials partenaires ;
- authentification renforcée pour actions sensibles ;
- rate limiting ;
- anti-replay ;
- idempotence ;
- contrôle d’accès ;
- logs structurés sans secrets ;
- masquage PII ;
- séparation des environnements ;
- audit immuable ;
- protection contre injection et altération de payload ;
- validation stricte devise/montant ;
- WAF sur APIs exposées.

Les quotes et taux ne doivent pas être modifiables côté client.

---

## 31. Données et minimisation

Conserver uniquement ce qui est nécessaire :

- IDs ;
- devise ;
- montants ;
- taux ;
- quote ;
- partenaire ;
- pricing snapshot ;
- statut ;
- contrôles conformité nécessaires ;
- audit.

Ne pas dupliquer inutilement les documents KYC dans le module FX. Référencer le dossier conformité central.

Politique de rétention par type de donnée, pays et obligation légale.

---

## 32. Observabilité

Métriques :

- quotes/minute ;
- taux de quote accepté ;
- conversions réussies ;
- conversions échouées ;
- latence quote ;
- latence settlement ;
- taux de timeout partenaire ;
- taux obsolètes ;
- spread moyen ;
- revenu de frais ;
- revenu de spread ;
- volume par devise ;
- volume par corridor ;
- exposition ;
- écarts de réconciliation ;
- reversals ;
- incidents fraude.

Alertes SRE et métier séparées.

---

## 33. Résilience

Techniques :

- timeout explicite ;
- retry exponentiel uniquement sur erreurs sûres ;
- idempotency key ;
- circuit breaker ;
- outbox transactionnelle ;
- inbox/dédoublonnage webhooks ;
- saga/state machine ;
- dead-letter queue ;
- reconciliation worker ;
- replay d’événements contrôlé ;
- cache de taux avec TTL strict ;
- plusieurs fournisseurs facultatifs.

Un partenaire indisponible doit pouvoir passer `DEGRADED` puis être sorti du routage sans arrêter les autres paires.

---

## 34. Jini

Jini peut :

- expliquer le taux et les frais ;
- aider à trouver le bon écran ;
- résumer l’historique ;
- signaler qu’un quote est expiré ;
- expliquer pourquoi une paire n’est pas disponible avec un message utilisateur non sensible ;
- générer une comparaison indicative entre devises ;
- préparer une action.

Jini ne doit jamais :

- inventer un taux ;
- modifier un quote ;
- contourner limite/KYC ;
- garantir un rendement futur ;
- effectuer une conversion financière sans authentification, autorisation et confirmation requises.

Toute action Jini passe par les Skills/Workflow Engine autorisés et les mêmes contrôles métier que l’interface classique.

---

## 35. Tests fonctionnels

Cas minimaux :

1. quote valide EUR/XOF ;
2. paire désactivée ;
3. quote expiré ;
4. solde insuffisant ;
5. limite journalière dépassée ;
6. utilisateur KYC insuffisant ;
7. partenaire timeout puis résultat retrouvé ;
8. retry idempotent sans double débit ;
9. arrondi correct ;
10. frais fixes ;
11. frais pourcentage ;
12. fixe + pourcentage ;
13. minimum/maximum ;
14. promotion ;
15. split de commission ;
16. taxe séparée ;
17. spread versionné ;
18. nouvelle grille future sans impact historique ;
19. réconciliation exacte ;
20. écart de taux détecté ;
21. reversal ;
22. partenaire désactivé ;
23. fallback vers autre fournisseur autorisé ;
24. affichage hors ligne indicatif sans exécution ;
25. ABAC refuse un opérateur hors pays ;
26. audit des changements admin.

---

## 36. Tests de sécurité

- falsification du taux client ;
- modification du montant après quote ;
- replay d’acceptation ;
- réutilisation d’idempotency key avec payload différent ;
- escalade de privilèges ;
- accès cross-tenant ;
- quote appartenant à un autre utilisateur ;
- injection ;
- brute force endpoints ;
- secrets dans logs ;
- webhook falsifié ;
- rollback d’une grille sans autorisation ;
- tentative d’activation d’une devise non autorisée ;
- race condition sur solde.

---

## 37. Tests de performance

Mesurer :

- p95/p99 génération quote ;
- concurrence sur même wallet ;
- débit de conversions ;
- cache rate provider ;
- traitement webhooks ;
- réconciliation de gros volumes ;
- dashboard positions ;
- montée en charge multi-pays.

Les objectifs chiffrés doivent être fixés selon l’infrastructure réelle et les SLA partenaires, pas inventés dans la documentation.

---

## 38. Scénarios de panne

### Rate provider indisponible

- ne pas générer de nouveau quote exécutable ;
- afficher statut temporairement indisponible ;
- éventuellement utiliser un autre fournisseur autorisé.

### Quote accepté, timeout partenaire

- état `PARTNER_PENDING` ;
- ne pas redébiter ;
- interroger statut ;
- réconcilier ;
- escalader si délai dépassé.

### Ledger indisponible

- aucune exécution financière finale ;
- conserver intention de manière sûre ;
- reprendre idempotemment.

### Webhook perdu

- polling statut ;
- retry ;
- réconciliation.

---

## 39. Modèles de données principaux

- `CurrencyDefinition`
- `CurrencyBalance`
- `FxPair`
- `FxCorridor`
- `FxRateSource`
- `FxRateSnapshot`
- `FxQuote`
- `FxConversion`
- `FxProvider`
- `FxProviderCapability`
- `FxRoutingPolicy`
- `FxPricingPolicy`
- `FxPricingVersion`
- `FxFeeSnapshot`
- `TaxComponent`
- `FxLimitPolicy`
- `TreasuryPosition`
- `SettlementBatch`
- `ReconciliationItem`
- `FxComplianceDecision`
- `FxAuditEvent`

Chaque table financière contient timestamps UTC, IDs opaques, métadonnées d’audit et version optimiste si nécessaire.

---

## 40. Ordre de développement recommandé

### Phase 1 — Fondations monétaires

- CurrencyDefinition ;
- amount type partagé ;
- précision/arrondi ;
- CurrencyBalance ;
- ledger multi-devises ;
- invariants et tests.

### Phase 2 — Taux et quotes

- FxPair ;
- provider abstrait ;
- mock provider ;
- rate snapshots ;
- quote engine ;
- expiration ;
- API lecture.

### Phase 3 — Conversion

- state machine ;
- réservation ;
- exécution interne mock ;
- ledger ;
- receipts ;
- idempotence.

### Phase 4 — Pricing central

- intégration frais/commissions ;
- spreads ;
- taxes ;
- versioning ;
- simulation ;
- approbation.

### Phase 5 — Partenaires et réconciliation

- adapters ;
- asynchronous status ;
- webhooks ;
- settlement ;
- reconciliation ;
- treasury positions.

### Phase 6 — Administration

- devises ;
- paires ;
- corridors ;
- pricing ;
- limites ;
- fournisseurs ;
- audit.

### Phase 7 — Canaux

- Client ;
- Commerce ;
- Entreprise ;
- Agent si autorisé ;
- API partenaires ;
- Jini.

### Phase 8 — Durcissement

- fraude ;
- AML ;
- performance ;
- résilience ;
- observabilité ;
- chaos tests ;
- DR ;
- conformité finale par pays.

---

## 41. Critères d’acceptation

Le module est considéré prêt pour un environnement de recette lorsque :

- toutes les devises sont gérées par définition centrale ;
- aucun montant n’utilise de floating point non sûr ;
- chaque quote possède source, timestamp et expiration ;
- un quote expiré est inexécutable ;
- une conversion est idempotente ;
- aucune panne réseau ne crée de double débit ;
- le ledger reste équilibré par devise ;
- le taux et pricing historiques sont immuables ;
- frais, spread, commissions et taxes sont configurables sans code ;
- les grilles sont versionnées et simulables ;
- les changements sensibles sont auditables ;
- les limites et contrôles KYC/AML sont appliqués ;
- les partenaires sont abstraits derrière adaptateurs ;
- la réconciliation détecte les écarts ;
- le fonctionnement hors ligne ne permet pas une conversion réelle non confirmée ;
- les droits RBAC/ABAC sont testés ;
- les feature flags fonctionnent par périmètre ;
- les dashboards de trésorerie et alertes critiques existent ;
- les tests fonctionnels, sécurité, résilience et performance requis sont passés.

---

## 42. Décisions structurantes à conserver

1. MANSA est **multi-devises par conception**, mais chaque devise reste activée explicitement.
2. Une conversion est toujours basée sur un **quote traçable et versionné**.
3. Le **taux de référence**, le **taux partenaire**, le **taux client** et le **taux effectif** sont distingués.
4. Aucun taux exécutable n’est inventé en cas de panne.
5. Le **Pricing & Commission Engine** central contrôle frais, spreads, commissions, taxes et promotions sans modification du code.
6. Chaque transaction conserve un **snapshot immuable** de son pricing et de son taux.
7. Les intégrations FX sont **multi-fournisseurs derrière adaptateurs**.
8. Les règles de disponibilité sont **multi-pays, multi-corridors et configurables**.
9. La comptabilité reste **en partie double et séparée par devise**.
10. La réconciliation et le suivi de trésorerie sont obligatoires avant production réelle.
11. Les capacités dépendant d’une licence, d’un partenaire ou d’un contrat restent désactivées tant que les prérequis réels ne sont pas satisfaits.
12. Toute extension future doit réutiliser ces primitives au lieu de créer un second moteur de conversion parallèle.
