# Cahier des charges — Relevés, attestations et documents financiers

## 1. Objet

Ce document définit les exigences Mansa relatives à la génération, consultation, téléchargement, partage, archivage et vérification des relevés de compte, attestations et autres documents financiers produits par la plateforme.

Le domaine couvre les utilisateurs particuliers, commerçants, agents, entreprises, administrations, organismes publics et partenaires autorisés.

L’objectif est de fournir des documents fiables, lisibles, vérifiables, multi-pays et cohérents avec le ledger Mansa, sans exposer plus de données que nécessaire et sans permettre la fabrication de documents contradictoires avec les écritures comptables de référence.

## 2. Principes directeurs

Mansa doit appliquer les principes suivants :

1. le ledger et les écritures financières validées restent la source de vérité ;
2. un relevé est une représentation d’un périmètre et d’une période, pas une base comptable indépendante ;
3. tout document généré doit être traçable, versionné et reproductible ;
4. les données affichées doivent dépendre du rôle, du tenant et des autorisations ;
5. aucun utilisateur ne doit pouvoir générer un document sur un compte ou une organisation auxquels il n’a pas accès ;
6. les montants, devises, frais, commissions et soldes doivent être calculés selon les règles financières déjà appliquées aux écritures ;
7. les documents officiels doivent pouvoir être vérifiés sans révéler de données sensibles supplémentaires ;
8. les exports ne doivent jamais contenir de secret, PIN, CVV, PAN complet, token privé ou donnée d’authentification ;
9. la génération de document ne doit jamais modifier une transaction ou un solde ;
10. les documents peuvent être régénérés, mais une version déjà émise officiellement doit conserver son identité et son empreinte ;
11. les documents doivent fonctionner en français et dans les langues activées par la politique de localisation ;
12. les dates, heures, numéros, devises et séparateurs doivent être localisés sans changer la valeur financière sous-jacente ;
13. un document annulé ou remplacé ne doit pas disparaître de l’audit ;
14. les documents à valeur probante doivent pouvoir être signés ou scellés numériquement selon l’environnement disponible ;
15. les règles de conservation doivent suivre la politique de gouvernance des données Mansa et les exigences locales applicables.

## 3. Périmètre fonctionnel

Le domaine comprend au minimum :

```text
ACCOUNT_STATEMENT
TRANSACTION_STATEMENT
BALANCE_CERTIFICATE
ACCOUNT_OWNERSHIP_CERTIFICATE
RIB_OR_ACCOUNT_DETAILS
PAYMENT_RECEIPT
TRANSFER_RECEIPT
FEE_STATEMENT
COMMISSION_STATEMENT
MERCHANT_SETTLEMENT_STATEMENT
AGENT_COMMISSION_STATEMENT
BUSINESS_ACTIVITY_STATEMENT
STATE_COLLECTION_STATEMENT
TAX_OR_ADMINISTRATIVE_RECEIPT
CARD_ACTIVITY_STATEMENT
WALLET_ACTIVITY_STATEMENT
SAVINGS_STATEMENT
ESCROW_STATEMENT
LOAN_OR_CREDIT_STATEMENT
CUSTOM_EXPORT
```

Tous ces types ne sont pas nécessairement disponibles dans tous les pays ou produits.

## 4. Types d’acteurs

Les documents doivent couvrir au minimum :

```text
CONSUMER
MERCHANT_OWNER
MERCHANT_EMPLOYEE
AGENT
AGENT_SUPERVISOR
BUSINESS_USER
BUSINESS_ADMIN
STATE_AGENT
STATE_SUPERVISOR
STATE_ADMIN
MANSA_SUPPORT
MANSA_OPERATIONS
AUDITOR
PARTNER_SYSTEM
```

Les droits diffèrent selon le type d’acteur et le périmètre organisationnel.

## 5. Concepts du domaine

Entités recommandées :

```text
FinancialDocument
FinancialDocumentVersion
StatementRequest
StatementPeriod
StatementSection
DocumentTemplate
DocumentTemplateVersion
DocumentBrandingProfile
DocumentLocale
DocumentArtifact
DocumentHash
DocumentSignature
DocumentVerificationToken
DocumentDelivery
DocumentAccessGrant
DocumentExportJob
DocumentAuditEvent
```

## 6. FinancialDocument

Un `FinancialDocument` représente l’identité logique d’un document.

Champs recommandés :

```text
id
organizationId?
userId?
accountId?
walletId?
merchantId?
agentId?
documentType
countryCode
currency?
periodStart?
periodEnd?
status
createdAt
issuedAt?
voidedAt?
replacedByDocumentId?
sourceSnapshotId?
```

Statuts possibles :

```text
DRAFT
GENERATING
ISSUED
AVAILABLE
VOIDED
REPLACED
EXPIRED
ARCHIVED
FAILED
```

## 7. Versionnement

Chaque émission officielle doit être versionnée.

Une `FinancialDocumentVersion` doit enregistrer au minimum :

```text
versionNumber
templateVersion
locale
brandingProfileVersion
generatedAt
contentHash
artifactId
signatureId?
reason
```

Une correction ne doit pas écraser silencieusement une version déjà émise.

Si un document doit être remplacé :

```text
ancienne version -> REPLACED
nouvelle version -> ISSUED
lien de remplacement conservé
raison de remplacement auditée
```

## 8. Relevé de compte

Le relevé standard doit pouvoir contenir :

- identité du titulaire selon le niveau d’autorisation ;
- identifiant de compte masqué lorsque nécessaire ;
- période du relevé ;
- devise ;
- solde d’ouverture ;
- mouvements débit/crédit ;
- frais ;
- remboursements ;
- ajustements autorisés ;
- solde de clôture ;
- résumé des entrées/sorties ;
- références utiles ;
- date de génération ;
- identifiant du document ;
- mécanisme de vérification.

Le relevé doit être réconciliable avec le ledger.

## 9. Calcul des soldes

Le système doit appliquer :

```text
openingBalance
+ credits
- debits
+/- authorized adjustments
= closingBalance
```

Le calcul doit utiliser les écritures comptables validées et les règles de disponibilité applicables.

Les opérations en attente ne doivent pas être mélangées avec les opérations comptabilisées sans distinction explicite.

## 10. États transactionnels

Les lignes de relevé doivent distinguer selon le domaine :

```text
PENDING
AUTHORIZED
CAPTURED
SETTLED
COMPLETED
REVERSED
REFUNDED
CANCELLED
FAILED
DISPUTED
```

Seuls les états pertinents doivent apparaître dans les documents destinés à l’utilisateur.

Les états techniques internes ne doivent pas être exposés tels quels s’ils ne sont pas compréhensibles ou s’ils révèlent des informations sensibles.

## 11. Périodes

Les relevés doivent supporter :

```text
DAY
WEEK
MONTH
QUARTER
YEAR
CUSTOM_RANGE
```

La période maximale configurable dépend du produit, de la politique de conservation et du rôle.

Les bornes de période doivent être interprétées dans le fuseau de référence du compte ou de l’organisation, tout en conservant les timestamps UTC dans le stockage technique.

## 12. Relevés mensuels automatiques

Mansa doit pouvoir générer automatiquement des relevés mensuels.

Workflow :

```text
fin de période
-> clôture logique de la fenêtre
-> lecture des écritures éligibles
-> calcul soldes ouverture/clôture
-> génération
-> hash/signature
-> archivage
-> notification facultative
```

Une génération en retard ne doit pas changer rétroactivement la période couverte.

## 13. Attestation de solde

Une attestation de solde doit indiquer :

- titulaire ;
- compte ou wallet concerné ;
- devise ;
- solde à une date/heure précise ;
- statut du solde si distinction disponible/réservé nécessaire ;
- date d’émission ;
- numéro de document ;
- moyen de vérification.

Le système doit distinguer :

```text
ledgerBalance
availableBalance
reservedBalance
```

Le document doit préciser quel solde est attesté.

## 14. Attestation de titularité

Elle doit pouvoir confirmer qu’un compte, wallet ou identifiant appartient à une personne ou organisation vérifiée.

Elle ne doit exposer que les données nécessaires :

```text
nom / raison sociale
identifiant masqué ou complet selon usage
statut du compte
pays
émetteur
identifiant document
```

Les informations KYC brutes ne doivent pas être intégrées par défaut.

## 15. Coordonnées de compte / RIB

Lorsque Mansa ou son partenaire bancaire fournit des coordonnées bancaires ou assimilées, le document peut inclure :

```text
accountHolderName
bankOrPartnerName
accountNumber / IBAN / identifiant local
BIC/SWIFT si applicable
currency
bankAddress si requis
referenceInstructions
```

Mansa ne doit pas afficher de faux IBAN ou identifiants bancaires si aucun partenaire n’en fournit réellement.

Le format doit être piloté par pays et partenaire.

## 16. Reçus de paiement

Chaque reçu doit pouvoir contenir :

- montant ;
- devise ;
- date et heure ;
- statut ;
- payeur masqué si nécessaire ;
- bénéficiaire/commerçant ;
- référence de transaction ;
- moyen de paiement générique ;
- frais ;
- taxe si applicable ;
- identifiant de reçu ;
- QR ou lien de vérification si activé.

Aucune donnée carte sensible ne doit apparaître au-delà des règles de masquage autorisées.

## 17. Reçus secteur public

Les paiements de l’État peuvent produire des reçus dédiés :

```text
service administratif
référence dossier
organisme bénéficiaire
poste / administration
agent ou canal d’encaissement si autorisé
montant principal
frais
pénalité éventuelle
date de paiement
statut de règlement
référence Mansa
référence État
```

Pour les péages et autres encaissements publics, le reçu doit rester compatible avec les politiques de marque blanche État/concessionnaire et la mention facultative `Propulsé par Mansa`.

## 18. Relevé commerçant

Le relevé commerçant doit pouvoir inclure :

```text
ventes brutes
remboursements
annulations
frais Mansa
frais partenaires
commissions
retenues
litiges / chargebacks
net à régler
règlements effectués
solde restant
```

Le document doit permettre le rapprochement avec les règlements réels.

## 19. Relevé agent

Un agent doit pouvoir obtenir un relevé de :

```text
cash-in
cash-out
commissions
bonus
ajustements
fonds de caisse / float selon modèle
écarts éventuels
règlements reçus
```

Les opérations appartenant à d’autres agents ne doivent jamais apparaître sauf permission hiérarchique explicite.

## 20. Relevé entreprise

Une organisation professionnelle peut générer :

- relevé consolidé ;
- relevé par wallet ;
- relevé par filiale ;
- relevé par établissement ;
- relevé par centre de coût ;
- relevé par utilisateur ;
- relevé par période ;
- relevé par projet.

Le scope doit être contrôlé par RBAC et multi-tenant.

## 21. Relevé État

Les administrations peuvent générer des documents consolidés par :

```text
ministère
agence
service
région
poste
péage
voie
type de taxe
type de recette
canal de paiement
période
```

Les totaux doivent rester rapprochables avec les encaissements et le règlement financier de référence.

## 22. Cartes

Les relevés liés aux cartes peuvent afficher :

- alias de carte ;
- quatre derniers chiffres lorsque disponibles et autorisés ;
- transactions ;
- retraits ;
- remboursements ;
- frais ;
- statut de carte.

Ne jamais afficher :

```text
PAN complet
CVV
PIN
cryptogramme dynamique
clé EMV
token réseau réutilisable
```

## 23. Wallets multiples

Un utilisateur possédant plusieurs wallets doit pouvoir :

```text
exporter un wallet
exporter plusieurs wallets
obtenir un relevé consolidé
```

Le document consolidé doit distinguer les devises et ne doit pas additionner des monnaies différentes sans méthode de conversion explicitement demandée.

## 24. Multi-devises

Les documents doivent préserver :

```text
originalAmount
originalCurrency
settlementAmount?
settlementCurrency?
exchangeRate?
rateTimestamp?
fees?
```

Toute conversion présentée doit préciser sa nature.

Un total multi-devises ne doit pas être présenté comme une somme homogène sans conversion documentée.

## 25. Frais et commissions

Les frais doivent être affichés selon la politique de transparence Mansa.

Chaque ligne peut distinguer :

```text
principalAmount
mansaFee
agentFee
partnerFee
networkFee
taxAmount
totalCharged
```

La répartition interne non destinée au client ne doit pas être exposée si elle est confidentielle.

## 26. Export CSV

Le format CSV doit être destiné aux traitements tabulaires.

Exigences :

- UTF-8 ;
- en-têtes stables et versionnés ;
- dates non ambiguës ;
- devise dans une colonne dédiée ;
- montants sous forme décimale non localisée pour intégration ;
- absence de formules exécutables ;
- protection contre CSV injection.

Les valeurs commençant par `=`, `+`, `-` ou `@` doivent être neutralisées lorsque nécessaire pour éviter l’exécution de formules par des tableurs.

## 27. Export PDF

Le PDF est le format humain principal pour les documents officiels.

Il doit supporter :

- pagination ;
- en-têtes/pieds de page ;
- logo ;
- marque blanche ;
- QR de vérification ;
- numéro de document ;
- date d’émission ;
- pages numérotées ;
- police intégrée/licenciée correctement ;
- rendu cohérent mobile/impression.

## 28. Autres formats

Selon les besoins :

```text
JSON
XLSX
OFX/équivalent futur
ISO 20022 export si pertinent et contractuellement supporté
```

Ces formats ne doivent être activés que lorsqu’un usage réel existe.

## 29. Génération asynchrone

Les documents volumineux doivent être générés via job asynchrone.

États :

```text
QUEUED
RUNNING
COMPLETED
FAILED
EXPIRED
```

Le système doit éviter les requêtes synchrones longues et coûteuses.

## 30. Idempotence

Une même demande avec la même clé d’idempotence ne doit pas créer plusieurs documents officiels identiques involontairement.

Clé possible :

```text
actor + documentType + scope + period + locale + templateVersion + requestKey
```

## 31. Snapshot des données

Pour les documents officiels, Mansa doit conserver une référence au snapshot logique utilisé.

Le système doit pouvoir expliquer :

```text
quelles écritures ont été incluses
quelle version de calcul a été utilisée
quel template a été appliqué
```

Cela permet de reproduire ou auditer le document.

## 32. Vérification publique limitée

Un tiers doit pouvoir vérifier l’authenticité d’un document sans accéder au compte.

La page de vérification peut afficher uniquement :

```text
document valid / invalid / revoked
document type
issuer
issuedAt
masked holder identity
masked reference
content hash status
```

Elle ne doit pas exposer automatiquement le détail des transactions.

## 33. QR de vérification

Le QR peut contenir :

```text
verification URL
opaque verification token
```

Il ne doit pas contenir :

```text
KYC complet
historique financier
secret d’API
session utilisateur
information carte sensible
```

Le token doit être non devinable et révocable si nécessaire.

## 34. Hash

Chaque artefact officiel doit disposer d’une empreinte cryptographique.

Exemple conceptuel :

```text
SHA-256(documentBytes)
```

La politique cryptographique doit rester alignée avec le cahier des charges KMS/HSM et ne pas coder en dur un algorithme non gouverné dans le domaine métier.

## 35. Signature numérique

Selon le niveau de maturité et le contexte réglementaire, Mansa doit pouvoir signer ou sceller les documents officiels.

La clé de signature ne doit jamais être stockée en clair dans le dépôt, la base métier ou un fichier applicatif.

La signature doit utiliser l’infrastructure cryptographique gouvernée de Mansa ou d’un partenaire autorisé.

## 36. Templates

Les templates doivent être versionnés.

Un `DocumentTemplate` peut être défini par :

```text
documentType
country
organizationType
brandProfile
locale
regulatoryProfile
```

Les modifications futures ne doivent pas altérer visuellement les documents historiques déjà émis.

## 37. Marque blanche

Les documents doivent supporter :

- logo État ;
- logo concessionnaire ;
- logo entreprise ;
- couleurs ;
- coordonnées ;
- mentions réglementaires ;
- footer personnalisé ;
- mention facultative `Propulsé par Mansa`.

La personnalisation ne doit jamais permettre de supprimer les références légales ou de vérification obligatoires.

## 38. Localisation

Le système doit utiliser le moteur de localisation Mansa.

Au minimum :

```text
fr
bm
en
```

selon les langues activées.

Les documents doivent supporter correctement les caractères Unicode et les futures langues RTL lorsque nécessaire.

## 39. Accessibilité

Les documents numériques doivent viser :

- ordre de lecture cohérent ;
- contraste suffisant ;
- tailles lisibles ;
- textes sélectionnables lorsque possible ;
- titres structurés ;
- alternatives textuelles pour les éléments utiles ;
- pas d’information essentielle portée uniquement par la couleur.

## 40. Permissions

Permissions recommandées :

```text
statement.read.self
statement.generate.self
statement.export.self
statement.read.organization
statement.generate.organization
statement.read.state
statement.generate.state
statement.verify
statement.void
statement.template.manage
statement.audit.read
```

Une permission globale ne doit pas être accordée implicitement.

## 41. Isolation multi-tenant

Toute requête doit être filtrée par tenant et scope.

Exemple :

```text
organizationId = authenticatedOrganization
AND accountId IN authorizedAccounts
```

Le simple fait de connaître un `documentId` ne doit jamais permettre de télécharger le document.

## 42. Liens de téléchargement

Les téléchargements doivent utiliser :

- URL signée courte durée ;
- autorisation serveur préalable ;
- token opaque ;
- expiration ;
- Content-Disposition contrôlé.

Les buckets de stockage ne doivent pas être publics par défaut.

## 43. Partage

Le partage externe peut être autorisé via `DocumentAccessGrant`.

Champs :

```text
recipient?
expiresAt
maxDownloads?
passwordProtected?
revokedAt?
createdBy
```

Le partage doit être révocable.

## 44. Notifications

Un document peut produire une notification :

```text
relevé mensuel disponible
attestation générée
export terminé
document remplacé
document révoqué
```

La notification ne doit pas joindre automatiquement un document sensible dans un canal non sécurisé.

## 45. E-mail et messagerie

Par défaut, Mansa doit préférer un lien sécurisé vers le document plutôt qu’une pièce jointe contenant toutes les données financières.

Une pièce jointe peut être autorisée selon politique organisationnelle et niveau de risque.

## 46. Stockage

Les artefacts doivent être conservés dans un stockage objet chiffré ou système équivalent.

Séparer :

```text
metadata en base
document bytes en object storage
hash/signature en metadata sécurisée
```

## 47. Chiffrement

Les documents doivent être protégés :

```text
in transit: TLS
at rest: encryption managed by approved key policy
```

Pour les documents particulièrement sensibles, un chiffrement additionnel par objet peut être activé.

## 48. Cache

Les documents financiers sensibles ne doivent pas être mis en cache publiquement.

Les réponses HTTP doivent appliquer des politiques adaptées :

```text
Cache-Control: private/no-store selon cas
```

## 49. Logs

Les logs peuvent contenir :

```text
documentId
documentType
status
actorId
organizationId
period
generationDuration
```

Ils ne doivent pas contenir le contenu intégral du relevé ni les données financières détaillées sans nécessité opérationnelle explicite.

## 50. Audit

Événements :

```text
DOCUMENT_REQUESTED
DOCUMENT_GENERATED
DOCUMENT_VIEWED
DOCUMENT_DOWNLOADED
DOCUMENT_SHARED
DOCUMENT_SHARE_REVOKED
DOCUMENT_VOIDED
DOCUMENT_REPLACED
DOCUMENT_VERIFIED
TEMPLATE_CHANGED
```

Pour les comptes privilégiés, les téléchargements doivent être auditables.

## 51. Rétention

Les durées de conservation sont pilotées par :

```text
country
product
documentType
accountType
legalHold
organizationPolicy
```

Une suppression de compte ne doit pas détruire un document qui doit légalement être conservé.

Inversement, les données sans obligation de conservation ne doivent pas être gardées indéfiniment.

## 52. Legal hold

Le système doit permettre un gel de conservation ciblé :

```text
LEGAL_HOLD
DISPUTE_HOLD
AUDIT_HOLD
REGULATORY_HOLD
```

Le gel doit empêcher la purge automatique sans rendre le document publiquement accessible.

## 53. Suppression et anonymisation

Après expiration de la rétention :

- supprimer l’artefact lorsque permis ;
- supprimer ou pseudonymiser les métadonnées non nécessaires ;
- conserver uniquement les preuves minimales exigées ;
- journaliser la purge.

## 54. Performance

Objectifs recommandés :

- petit reçu : génération quasi immédiate ;
- relevé mensuel : quelques secondes ;
- export annuel volumineux : job asynchrone ;
- génération massive entreprise/État : traitement batch contrôlé.

Les seuils exacts sont définis par SLO et capacité réelle.

## 55. Pagination des données source

La génération ne doit pas charger des millions de transactions en mémoire.

Utiliser :

```text
cursor pagination
streaming
chunk processing
```

La sortie PDF/CSV doit pouvoir être construite par flux lorsque techniquement pertinent.

## 56. Reprise après erreur

Un job interrompu doit pouvoir :

```text
reprendre depuis checkpoint
ou redémarrer idempotemment
```

Un fichier partiellement généré ne doit jamais passer à `ISSUED`.

## 57. Cohérence temporelle

Un relevé doit utiliser une vue cohérente des écritures.

Il ne faut pas que le solde d’ouverture et les transactions soient calculés sur deux états de base incompatibles.

Utiliser snapshot transactionnel, version de ledger ou mécanisme équivalent selon l’architecture.

## 58. Transactions tardives

Une écriture comptabilisée après l’émission d’un relevé historique ne doit pas modifier silencieusement le document déjà signé.

Options :

```text
correction sur période suivante
relevé rectificatif
nouvelle version explicitement marquée
```

La méthode dépend de la règle comptable du produit.

## 59. Litiges

Une transaction litigieuse peut être affichée avec un statut compréhensible.

Le document ne doit pas supprimer la transaction d’origine.

Les remboursements et chargebacks doivent être représentés comme événements distincts ou relations explicites.

## 60. Tests unitaires

Couvrir au minimum :

- calcul solde ouverture/clôture ;
- inclusion/exclusion par statut ;
- périodes ;
- devises ;
- frais ;
- masquage ;
- permissions ;
- versionnement ;
- hash ;
- QR/token de vérification ;
- protection CSV injection.

## 61. Tests d’intégration

Scénarios :

```text
ledger -> statement
wallet -> PDF
merchant settlement -> statement
agent commissions -> statement
state collection -> receipt
storage -> signed download
verification token -> limited public verification
```

## 62. Tests multi-tenant

Tests négatifs obligatoires :

- utilisateur A ne lit pas le relevé B ;
- entreprise A ne lit pas entreprise B ;
- agent A ne lit pas agent B ;
- administration A ne lit pas administration B sans mandat explicite ;
- un lien expiré ne télécharge plus le document ;
- un `documentId` deviné ne contourne pas l’autorisation.

## 63. Tests financiers

Comparer les résultats du document avec les données du ledger.

Invariants :

```text
closing = opening + credits - debits +/- adjustments
sum(lines) cohérent avec totaux
currency preserved
no duplicate transaction
```

## 64. Tests de sécurité

Vérifier :

- IDOR ;
- contrôle d’accès ;
- fuite par URL ;
- stockage public accidentel ;
- injection CSV ;
- XSS dans contenu HTML intermédiaire ;
- template injection ;
- path traversal ;
- métadonnées PDF sensibles ;
- tokens de vérification devinables ;
- expiration de lien ;
- logs contenant données interdites.

## 65. Tests de charge

Simuler :

- clôture mensuelle de masse ;
- génération simultanée entreprise ;
- exports État ;
- nombreux téléchargements ;
- régénération contrôlée.

La génération documentaire ne doit pas saturer le traitement des paiements temps réel.

## 66. Observabilité

Métriques :

```text
documents_generated_total
document_generation_failures_total
document_generation_duration_ms
exports_queued
exports_running
downloads_total
verification_requests_total
storage_errors_total
```

Alertes sur :

- taux d’échec élevé ;
- jobs bloqués ;
- divergence de rapprochement ;
- volume anormal de téléchargements ;
- accès refusés massifs.

## 67. Administration

Le portail d’administration doit permettre selon permission :

- rechercher un document ;
- voir son statut ;
- voir les métadonnées ;
- régénérer si autorisé ;
- révoquer un partage ;
- invalider un document ;
- consulter l’audit ;
- gérer les templates ;
- gérer les profils de marque.

Le support ne doit pas pouvoir éditer manuellement le montant d’un document.

## 68. Contrôles anti-fraude

Détecter notamment :

- téléchargements massifs anormaux ;
- nombreuses attestations de solde ;
- demandes répétées après changement de compte ;
- partage externe en volume ;
- tentative d’accès cross-tenant ;
- génération d’attestations après récupération récente de compte.

Ces signaux alimentent le risk engine et ne constituent pas seuls une preuve de fraude.

## 69. API recommandée

Exemples :

```text
POST /statements
GET /statements
GET /statements/:id
POST /statements/:id/export
GET /statements/:id/download
POST /statements/:id/share
DELETE /statements/:id/share/:grantId
POST /statements/:id/void
POST /statements/:id/regenerate
GET /verify-document/:token
```

Les routes exactes doivent respecter les conventions API Mansa.

## 70. Événements métier

Événements possibles :

```text
financial_document.requested
financial_document.issued
financial_document.failed
financial_document.downloaded
financial_document.shared
financial_document.revoked
financial_document.replaced
financial_document.verified
```

Ils doivent être idempotents côté consommateur lorsque nécessaire.

## 71. Intégration notifications

Le module Notifications peut écouter :

```text
financial_document.issued
financial_document.failed
financial_document.replaced
```

Le contenu du message doit respecter la préférence linguistique et la confidentialité du canal.

## 72. Intégration Jini

Jini peut répondre à :

- « mon relevé est-il disponible ? » ;
- « où télécharger mon reçu ? » ;
- « explique-moi cette ligne ».

Jini ne doit pas inventer de solde ou de transaction.

Toute donnée financière utilisée par Jini doit provenir d’une API autorisée et respecter les mêmes permissions.

## 73. Intégration support

Le support peut aider à localiser un document mais ne doit pas :

- changer le montant ;
- fabriquer un faux relevé ;
- contourner le tenant ;
- envoyer un document sensible vers un canal non vérifié.

## 74. Intégration partenaires

Une banque, un acquéreur, un opérateur ou une administration peut fournir des références à afficher.

Les données partenaires doivent être conservées telles que reçues et distinguées des références internes Mansa.

## 75. Documents hors ligne

Les reçus locaux hors ligne peuvent être générés sur terminal uniquement si le produit l’autorise.

Ils doivent être marqués de manière explicite :

```text
OFFLINE_PENDING_SYNC
```

Après synchronisation :

- rattacher le reçu à la transaction serveur ;
- éviter les doublons ;
- signaler toute divergence ;
- produire le document final si nécessaire.

## 76. Péages et bornes

Pour les péages :

- la borne peut imprimer un reçu minimal ;
- le reçu doit reprendre la transaction réellement validée ;
- l’identité de l’exploitant peut être en marque blanche ;
- `Propulsé par Mansa` reste facultatif ;
- espèces, carte, NFC, carte Mansa, wallet, QR et Mobile Money doivent apparaître uniquement selon les canaux activés ;
- le reçu ne doit jamais prétendre qu’un réseau carte non activé par l’acquéreur est accepté ;
- une opération hors ligne doit être marquée et resynchronisée sans double débit ;
- l’ouverture manuelle d’une barrière ne doit pas produire un faux reçu de paiement.

Les deux architectures de référence restent inchangées :

```text
A. péage automatique classique avec barrière
B. télépéage RFID UHF avec barrière
```

Le free-flow futur reste optionnel et ne remplace pas les deux solutions initiales.

## 77. Documents d’audit péage

Pour rapprochement anti-corruption, un export autorisé peut relier :

```text
vehiclePassageId
vehicleCategory
expectedTariff
paymentTransactionId
paymentAmount
barrierOpeningEventId
manualOpeningReason?
operatorId?
```

Ce document est réservé aux rôles d’audit autorisés et ne doit pas être exposé aux usagers ordinaires.

## 78. Conformité et responsabilité

Le module doit permettre l’adaptation aux exigences locales sans déclarer automatiquement qu’un document constitue une preuve légale universelle.

Le statut juridique d’une attestation, signature ou reçu dépend :

- du pays ;
- de l’entité émettrice ;
- du partenaire réglementé ;
- du type de produit ;
- du contrat.

Les mentions doivent donc être configurables par profil réglementaire.

## 79. Migration

Si des reçus ou relevés existent avant ce module :

1. inventorier les anciens formats ;
2. conserver leurs identifiants ;
3. ne pas recalculer silencieusement l’historique ;
4. attacher un `legacySource` ;
5. convertir uniquement lorsque nécessaire ;
6. vérifier les hashes après migration.

## 80. Critères d’acceptation

Le module est acceptable lorsque :

- un client peut télécharger un relevé exact ;
- un commerçant peut rapprocher ses règlements ;
- un agent voit uniquement son périmètre ;
- une entreprise peut produire des exports contrôlés ;
- une administration peut obtenir des relevés consolidés audités ;
- chaque document officiel possède une identité stable ;
- le PDF et le CSV sont cohérents avec le ledger ;
- les documents sont protégés contre les accès cross-tenant ;
- les liens expirent correctement ;
- les documents peuvent être vérifiés sans fuite excessive ;
- les versions remplacées restent traçables ;
- aucune donnée carte ou secret interdit n’est exporté ;
- les tests financiers, sécurité et multi-tenant passent.

## 81. Résultat attendu

Mansa doit disposer d’un service documentaire financier unique capable de produire des relevés et attestations cohérents pour les particuliers, commerçants, agents, entreprises et administrations.

Ce service doit rester strictement dérivé du ledger et des sources métier autorisées, offrir des documents vérifiables et localisés, supporter la marque blanche et les intégrations publiques, et préserver l’isolation multi-tenant, la confidentialité, la traçabilité et les exigences de sécurité d’une plateforme fintech.