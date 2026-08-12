# 11 — Open Banking / Connexion banques

## 1. Objectif

Le module Open Banking / Connexion banques permet à MANSA de connecter, avec consentement explicite de l’utilisateur et uniquement lorsque le cadre réglementaire et les partenaires le permettent, des comptes bancaires externes afin de consulter des soldes et transactions, agréger plusieurs comptes, améliorer la vision financière de l’utilisateur et, lorsque l’infrastructure contractuelle l’autorise, initier certains virements ou paiements.

MANSA ne doit jamais être codé comme si toutes les banques d’un pays exposaient des API Open Banking. Le module repose sur des adaptateurs abstraits vers banques, agrégateurs, switchs, prestataires d’initiation de paiement ou infrastructures nationales/régionales autorisées. Chaque capacité est activée séparément par pays, banque, partenaire, type de compte et canal.

Le principe directeur est : aucun accès bancaire sans consentement valide, limité, traçable, révocable et techniquement vérifié.

## 2. Périmètre fonctionnel

Le module couvre :

- connexion d’un compte bancaire externe ;
- authentification/redirection vers le partenaire lorsque requise ;
- consentement d’accès aux données ;
- consultation de comptes et sous-comptes ;
- soldes disponibles/comptables lorsque fournis ;
- historique de transactions ;
- catégorisation enrichie côté MANSA ;
- agrégation multi-banques ;
- rafraîchissement manuel et planifié ;
- suivi de fraîcheur de donnée ;
- reconnexion lorsque l’autorisation expire ;
- révocation du consentement ;
- suppression/dissociation de la connexion côté MANSA ;
- initiation de virement/paiement uniquement si capacité réglementaire et partenaire active ;
- suivi de statut d’un paiement initié ;
- rapprochement entre opérations externes et ledger MANSA lorsqu’une opération implique MANSA ;
- notifications ;
- administration des banques, capacités, partenaires, règles, limites, frais et incidents.

Hors périmètre par défaut : conservation des identifiants bancaires secrets de l’utilisateur, contournement de l’authentification bancaire, scraping non contractuel, promesse de temps réel lorsqu’un fournisseur ne le garantit pas, ou initiation de paiement sans habilitation contractuelle.

## 3. Capacités et niveaux d’intégration

Chaque connexion expose des capacités explicites :

- `ACCOUNTS_READ` : lire la liste des comptes ;
- `BALANCES_READ` : lire les soldes ;
- `TRANSACTIONS_READ` : lire les transactions ;
- `BENEFICIARIES_READ` : lire les bénéficiaires lorsque disponible ;
- `PAYMENT_INITIATION` : initier un paiement/virement ;
- `PAYMENT_STATUS_READ` : suivre son statut ;
- `IDENTITY_READ` : récupérer les données d’identité bancaire strictement nécessaires ;
- `REFRESH_TOKEN` ou mécanisme équivalent : renouveler techniquement l’accès dans les limites du consentement.

Aucune capacité n’est déduite. Elle provient de la configuration partenaire et du consentement réellement accordé.

Trois modes d’intégration sont prévus :

1. **API bancaire directe** : contrat avec une banque ou infrastructure disposant d’API documentées.
2. **Agrégateur / prestataire Open Banking** : MANSA s’intègre à un partenaire couvrant plusieurs banques.
3. **Infrastructure régionale/nationale** : switch, hub, API bancaire mutualisée ou autre infrastructure autorisée.

Tous les modes implémentent des interfaces communes afin d’éviter le couplage au fournisseur.

## 4. Parcours de connexion bancaire

### 4.1 Découverte

L’utilisateur ouvre `Ajouter une banque`. MANSA affiche uniquement les banques ou partenaires activés pour son pays et son type de profil.

Chaque entrée peut afficher : nom public, logo autorisé, types de comptes supportés, capacités, statut du service, durée indicative du consentement, date de dernière synchronisation globale et éventuelles limites connues.

### 4.2 Consentement

Avant redirection, MANSA présente :

- données demandées ;
- finalité ;
- capacités activées ;
- durée du consentement ;
- fréquence de rafraîchissement ;
- possibilité de révocation ;
- partenaire technique impliqué ;
- politique de conservation ;
- frais éventuels clairement séparés.

Le consentement est versionné et horodaté. Il possède un identifiant propre et un snapshot des scopes demandés/accordés.

### 4.3 Authentification externe

MANSA utilise OAuth2/OIDC, redirection bancaire, SCA/step-up, signature ou mécanisme partenaire prévu. Les identifiants bancaires de l’utilisateur ne transitent pas par MANSA lorsqu’un flux de redirection standard existe.

Les paramètres `state`, PKCE et protections anti-CSRF sont utilisés lorsque compatibles avec le protocole. Les callbacks sont validés avant création de la connexion.

### 4.4 Sélection des comptes

Si plusieurs comptes sont accessibles, l’utilisateur choisit ceux qu’il veut connecter. L’application ne doit pas importer automatiquement tous les comptes si le consentement permet un choix plus fin.

### 4.5 Synchronisation initiale

MANSA récupère les données disponibles, les normalise, calcule un statut de fraîcheur et affiche clairement la source. Une synchronisation incomplète ne doit pas être présentée comme complète.

États de connexion : `INITIATED`, `AWAITING_AUTH`, `ACTIVE`, `PARTIALLY_ACTIVE`, `REAUTH_REQUIRED`, `EXPIRED`, `REVOKED`, `SUSPENDED`, `ERROR`, `DISCONNECTED`.

## 5. Agrégation et présentation des comptes

L’espace agrégé doit pouvoir afficher :

- banque/source ;
- type de compte ;
- alias utilisateur ;
- devise ;
- solde disponible ;
- solde comptable si fourni ;
- date/heure du dernier rafraîchissement ;
- état de la connexion ;
- transactions récentes ;
- catégories ;
- revenus/dépenses agrégés ;
- tendances et budgets si l’utilisateur les active.

Les soldes externes restent distingués du solde du wallet MANSA. Aucun total agrégé ne doit laisser croire que tous les fonds sont détenus par MANSA.

## 6. Transactions et normalisation

Les données de transactions provenant de banques hétérogènes sont normalisées dans un modèle commun tout en conservant la donnée source nécessaire à l’audit.

Champs principaux : date d’opération, date de valeur si fournie, montant, devise, sens, libellé brut, libellé normalisé, contrepartie, catégorie, référence fournisseur, statut, compte source et métadonnées non sensibles autorisées.

MANSA peut enrichir :

- catégorisation ;
- détection d’abonnements ;
- dépenses récurrentes ;
- budgets ;
- rapprochement manuel ;
- recherche ;
- tags personnels.

L’enrichissement MANSA ne remplace jamais la donnée bancaire brute. Les deux couches restent distinguables.

## 7. Initiation de paiement / virement

La fonctionnalité n’est disponible que si `PAYMENT_INITIATION` est activée pour le pays, le partenaire et le compte.

Parcours type :

1. choix du compte débiteur ;
2. choix/saisie du bénéficiaire selon capacités ;
3. montant et devise ;
4. motif/référence ;
5. estimation des frais ;
6. contrôles de limites et fraude ;
7. consentement/confirmation ;
8. authentification forte ou redirection partenaire ;
9. création du `BankPaymentInitiation` ;
10. suivi jusqu’au statut final ou inconnu ;
11. notification et reçu/statut.

États : `DRAFT`, `READY`, `AUTH_REQUIRED`, `SUBMITTED`, `ACCEPTED`, `PENDING`, `COMPLETED`, `REJECTED`, `CANCELLED`, `FAILED`, `UNKNOWN`.

Un timeout ne signifie jamais échec définitif. En cas de statut incertain, MANSA marque `UNKNOWN/PENDING_RECONCILIATION` et interroge la source de vérité avant toute nouvelle tentative afin d’éviter les doubles paiements.

## 8. Modèle de données

Entités principales :

- `BankDirectoryEntry`: id, countryCode, institutionCode, displayName, capabilities, currencies, providerId, status.
- `OpenBankingProvider`: id, tenantId, type, countries, capabilities, authMode, webhookConfigRef, status.
- `BankConnection`: id, userId/businessId, providerId, institutionId, countryCode, status, consentId, createdAt, lastSyncedAt, expiresAt, errorCode.
- `BankConsent`: id, subjectId, providerId, institutionId, requestedScopes, grantedScopes, purpose, policyVersion, grantedAt, expiresAt, revokedAt, status.
- `ExternalBankAccount`: id, connectionId, providerAccountRef, maskedIdentifier, accountType, currency, displayName, status.
- `ExternalBalanceSnapshot`: accountId, available, booked, currency, asOf, providerObservedAt.
- `ExternalTransaction`: accountId, providerTransactionRef, amount, currency, direction, bookedAt, valueDate, rawDescription, normalizedDescription, counterpartyRef, status, sourcePayloadHash.
- `TransactionEnrichment`: transactionId, category, recurringGroupId, tags, modelVersion, userOverride.
- `BankPaymentInitiation`: id, subjectId, sourceAccountId, beneficiaryRef, amount, currency, providerId, partnerReference, idempotencyKey, status, pricingSnapshotId.
- `BankPaymentStatusEvent`: initiationId, status, providerObservedAt, rawCode, normalizedReason.
- `BankBeneficiary`: connectionId, providerBeneficiaryRef, maskedAccountRef, name, status.
- `SyncJob`: connectionId, type, cursor, startedAt, completedAt, status, retryCount.
- `ConsentAuditEvent`, `BankConnectionAuditEvent`, `BankWebhookEvent`, `BankReconciliationCase`.

Les tokens, secrets et références sensibles sont stockés dans un coffre/secret manager ou mécanisme sécurisé adapté, jamais dans les logs ou dans des champs exposés publiquement.

## 9. Règles métier

- Aucun appel fournisseur n’est effectué sans connexion active et consentement correspondant, sauf opérations techniques strictement nécessaires à la révocation/sécurité.
- Un consentement expiré bloque les nouveaux rafraîchissements.
- Une révocation côté utilisateur prend effet immédiatement côté MANSA et déclenche la révocation partenaire lorsque l’API le permet.
- Les données déjà importées suivent la politique de rétention applicable ; elles ne sont pas conservées indéfiniment par défaut.
- Les transactions sont dédupliquées par référence partenaire, compte, montant/date et stratégie de secours configurable.
- Les corrections fournisseur créent des mises à jour historisées, pas une suppression silencieuse de l’historique.
- Les soldes portent un timestamp de fraîcheur obligatoire.
- Un paiement bancaire est idempotent par clé métier et par partenaire.
- Les limites de paiement sont évaluées avant soumission et peuvent dépendre du pays, du niveau KYC, du risque, du compte, de la devise et du partenaire.
- Aucun bénéficiaire externe n’est créé ou modifié sans step-up lorsque le risque l’exige.

## 10. Pricing & Commission Engine

Toutes les opérations tarifables appellent le Pricing & Commission Engine central. Les règles peuvent être configurées sans modification de code selon : pays, devise, institution, partenaire, type de compte, canal, type d’utilisateur, segment, volume, type d’opération et période.

Modes supportés :

- montant fixe ;
- pourcentage ;
- fixe + pourcentage ;
- minimum ;
- maximum ;
- paliers ;
- gratuité ;
- quota d’opérations gratuites ;
- promotion temporaire ;
- tarification selon volume.

Répartition configurable : MANSA, agent, commerçant si pertinent, banque/prestataire, apporteur et taxes séparées.

Cycle tarifaire : `DRAFT → SIMULATED → APPROVAL_REQUIRED → SCHEDULED → ACTIVE → RETIRED`.

Toute modification sensible suit maker-checker. Une simulation permet de tester plusieurs montants, segments et pays avant activation. Chaque opération conserve un `pricingSnapshotId` immuable contenant la version, les règles, frais, taxes, commissions et bénéficiaires réellement appliqués.

Les frais éventuellement facturés par la banque et non contrôlés par MANSA doivent être présentés séparément comme frais externes estimés ou confirmés selon la donnée reçue.

## 11. RBAC / ABAC

Rôles types :

- client particulier ;
- utilisateur entreprise ;
- administrateur entreprise ;
- support ;
- opérateur Open Banking ;
- conformité ;
- fraude ;
- finance/réconciliation ;
- admin pays ;
- super admin ;
- partenaire technique via scopes machine-to-machine.

ABAC prend en compte : tenant, pays, institution, partenaire, type de compte, propriétaire, niveau KYC/KYB, risque, finalité, sensibilité, consentement et environnement.

Un agent support ne peut pas lire librement les transactions bancaires complètes. L’accès doit être limité au besoin d’en connaître, masqué lorsque possible et audité. Les exports sensibles, overrides, modifications de limites et changements tarifaires nécessitent permissions dédiées et éventuellement maker-checker.

## 12. API

API interne/externe versionnée, par exemple :

- `GET /v1/open-banking/institutions` ;
- `POST /v1/open-banking/connections` ;
- `GET /v1/open-banking/connections/:id` ;
- `POST /v1/open-banking/connections/:id/refresh` ;
- `POST /v1/open-banking/connections/:id/reauthorize` ;
- `POST /v1/open-banking/connections/:id/revoke` ;
- `GET /v1/open-banking/accounts` ;
- `GET /v1/open-banking/accounts/:id/balances` ;
- `GET /v1/open-banking/accounts/:id/transactions` ;
- `POST /v1/open-banking/payment-initiations` ;
- `GET /v1/open-banking/payment-initiations/:id` ;
- endpoints admin pour partenaires, banques, capacités, limites, pricing, incidents et audit.

Toutes les écritures transactionnelles utilisent idempotency keys. Pagination par curseur pour historiques volumineux. Les objets exposés ne révèlent pas les identifiants secrets du fournisseur.

## 13. Interfaces partenaires

Contrats abstraits :

- `BankDirectoryProvider` ;
- `BankAuthorizationProvider` ;
- `AccountInformationProvider` ;
- `BalanceProvider` ;
- `TransactionProvider` ;
- `PaymentInitiationProvider` ;
- `PaymentStatusProvider` ;
- `BeneficiaryProvider` ;
- `ConsentRevocationProvider`.

Chaque adapter déclare ses capacités, contraintes, timeouts, stratégie de pagination, mécanisme d’authentification, règles de signature et normalisation d’erreurs.

Aucun nom de fournisseur n’est codé comme dépendance métier centrale.

## 14. Webhooks et événements

Webhooks entrants : signature, timestamp, anti-replay, idempotence, validation de schéma, journalisation technique et dead-letter queue.

Événements sortants possibles :

- `bank.connection.created` ;
- `bank.connection.activated` ;
- `bank.connection.reauth_required` ;
- `bank.connection.revoked` ;
- `bank.sync.completed` ;
- `bank.sync.failed` ;
- `bank.account.updated` ;
- `bank.transaction.created` ;
- `bank.transaction.updated` ;
- `bank.payment.submitted` ;
- `bank.payment.completed` ;
- `bank.payment.failed` ;
- `bank.payment.status_unknown`.

Livraison via outbox, retries avec backoff, déduplication et conservation contrôlée.

## 15. Feature flags et administration

Feature flags par pays, tenant, banque, partenaire, segment et canal :

- connexion bancaire ;
- lecture comptes ;
- soldes ;
- transactions ;
- enrichissement ;
- budgets multi-banques ;
- initiation de paiement ;
- bénéficiaires ;
- rafraîchissement automatique ;
- Jini ;
- export ;
- webhooks B2B.

Admin : catalogue institutions, capacités, versions d’API, statuts, maintenance, consentements, politiques de durée, fréquence de sync, limites, quotas, erreurs normalisées, webhooks, pricing, incidents, rapprochements et dashboards.

Un kill switch global et des kill switches par pays/partenaire/capacité doivent permettre de désactiver rapidement lecture ou initiation de paiement sans supprimer les données ni casser les autres modules.

## 16. Sécurité

- TLS partout ;
- OAuth2/OIDC/PKCE/mTLS/signatures selon partenaire ;
- secrets et tokens dans coffre sécurisé ;
- rotation des secrets ;
- chiffrement au repos des données sensibles ;
- masquage des identifiants de compte ;
- step-up authentication pour opérations à risque ;
- anti-CSRF sur callbacks ;
- `state` et nonce ;
- anti-replay ;
- validation stricte des redirections ;
- rate limiting ;
- détection d’abus ;
- logs sans tokens ni numéros de compte complets ;
- audit append-only des opérations sensibles ;
- séparation environnements Sandbox/Recette/Production.

Une compromission d’un token doit pouvoir entraîner révocation ciblée, suspension de la connexion et rotation sans impact sur les autres connexions.

## 17. Conformité, consentement et données

Le module doit être paramétrable selon les exigences locales applicables. Aucun cadre réglementaire n’est supposé identique entre pays.

Principes : finalité déterminée, minimisation, durée limitée, consentement versionné lorsque requis, preuve de consentement, révocation facile, droits d’accès/export/suppression dans les limites légales, conservation comptable séparée lorsque nécessaire.

Les données bancaires agrégées ne sont pas revendues ou utilisées à une finalité incompatible sans base légale/consentement approprié.

Pour les entreprises, les accès peuvent être liés à des mandats organisationnels et aux rôles internes, avec expiration automatique lorsque l’utilisateur quitte l’organisation.

## 18. Fraude et risque

Signaux possibles :

- nouvelle banque + nouvel appareil + gros montant ;
- ajout récent de bénéficiaire ;
- vélocité d’initiations ;
- incohérence pays/appareil ;
- connexions multiples inhabituelles ;
- répétition de callbacks invalides ;
- réauthentifications anormales ;
- tentative sur compte suspendu ;
- bénéficiaire à risque ;
- divergence entre nom/identité lorsque donnée légalement disponible.

Actions : permettre, step-up, temporiser, mettre en revue, bloquer la capacité d’initiation, suspendre une connexion ou déclencher investigation. La lecture de données et l’initiation de paiement peuvent avoir des politiques de risque distinctes.

## 19. Multi-pays et multi-devises

Chaque objet porte `countryCode`, `currency`, `providerId` et version de configuration. Les banques, capacités, consentements, durées, règles, limites et modes d’authentification varient par pays.

Un compte peut être dans une devise différente du wallet MANSA. Les totaux agrégés doivent conserver la devise native et, si une conversion d’affichage est proposée, afficher le taux et le timestamp utilisés. Aucune conversion réelle n’est exécutée sans passer par le module Change/Multi-devises et un partenaire autorisé.

## 20. Réseau faible et hors ligne

Les données déjà synchronisées peuvent être affichées en cache local chiffré selon politique, avec indication visible de leur âge.

Hors ligne :

- consultation de données déjà téléchargées ;
- préparation locale d’un brouillon de paiement éventuellement autorisée ;
- aucune soumission bancaire considérée comme effectuée tant que le serveur/partenaire n’a pas confirmé la réception ;
- aucune duplication lors de la reprise grâce à l’idempotence ;
- file d’attente locale chiffrée uniquement pour données nécessaires ;
- purge après synchronisation selon politique.

Les soldes obsolètes sont marqués `STALE`, jamais affichés comme temps réel.

## 21. Jini

Jini peut, avec permission explicite :

- expliquer les dépenses ;
- résumer les comptes ;
- rechercher une transaction ;
- détecter une dépense récurrente ;
- aider à créer un budget ;
- signaler une connexion expirée ;
- préparer un virement.

Jini ne doit jamais initier silencieusement un virement. Toute action financière utilise un Skill transactionnel autorisé, un contexte de consentement valide, les contrôles de risque et la confirmation adaptée.

Les données bancaires fournies au moteur IA sont minimisées et isolées par tenant/session selon la politique Jini.

## 22. Ledger et rapprochement

La simple lecture de comptes externes ne crée pas d’écriture dans le ledger MANSA.

Une initiation de paiement impliquant frais MANSA crée les écritures nécessaires pour frais, taxes, commissions et règlements, distinctes du mouvement bancaire externe.

Rapprochement : statut partenaire, éventuel PSP/switch, frais, ledger MANSA et référence bancaire. Les écarts créent un `BankReconciliationCase` avec motif, propriétaire, SLA et résolution auditée.

Aucune correction ne modifie destructivement une écriture historique ; les ajustements sont compensatoires.

## 23. Observabilité

Métriques principales :

- taux de connexion réussie ;
- taux d’abandon auth ;
- connexions actives/expirées ;
- délai moyen de synchronisation ;
- taux d’erreur par banque/partenaire ;
- fraîcheur moyenne des données ;
- volume de transactions importées ;
- taux de déduplication ;
- taux de paiement réussi ;
- paiements en statut inconnu ;
- latence fournisseur ;
- erreurs webhook ;
- files DLQ ;
- incidents ;
- revenus/frais/commissions du module.

Correlation IDs de bout en bout sans exposer les secrets dans les traces.

## 24. Performance et résilience

- synchronisation asynchrone pour gros historiques ;
- pagination/cursors ;
- cache court pour catalogue bancaire ;
- timeouts par fournisseur ;
- circuit breakers ;
- retries uniquement sur opérations sûres/idempotentes ;
- outbox/inbox ;
- dégradation gracieuse ;
- backpressure ;
- reprise après incident ;
- isolation des partenaires pour éviter qu’une panne banque bloque tout MANSA.

En cas d’indisponibilité fournisseur, MANSA affiche la dernière donnée connue avec timestamp et état, et ne fabrique jamais de nouveau statut.

## 25. Notifications

Notifications configurables :

- banque connectée ;
- connexion expirant bientôt ;
- réauthentification requise ;
- synchronisation impossible ;
- nouveau compte détecté ;
- paiement soumis ;
- paiement terminé ;
- paiement rejeté ;
- statut de paiement incertain ;
- consentement révoqué ;
- activité de sécurité inhabituelle.

Canaux selon préférences : push, in-app, email, SMS ou Jini Voice uniquement si activés et adaptés à la sensibilité.

## 26. Tests

### 26.1 Unitaires

- états de connexion ;
- durée/expiration consentement ;
- normalisation transaction ;
- déduplication ;
- mapping d’erreurs ;
- pricing ;
- limites ;
- permissions ;
- calcul de fraîcheur.

### 26.2 Contrats partenaires

- OAuth/callback ;
- comptes ;
- soldes ;
- pagination transactions ;
- initiation paiement ;
- statut paiement ;
- webhooks ;
- révocation ;
- scénarios d’erreur.

### 26.3 Intégration

- connexion → consentement → comptes → sync ;
- expiration → réauthentification ;
- révocation → blocage sync ;
- paiement → authentification → statut → rapprochement ;
- pricing snapshot → ledger.

### 26.4 E2E

- particulier multi-banques ;
- entreprise ;
- support avec données masquées ;
- admin partenaire ;
- panne fournisseur ;
- utilisateur hors ligne puis reprise.

### 26.5 Sécurité

- CSRF callback ;
- open redirect ;
- vol/replay de callback ;
- token leakage ;
- IDOR ;
- élévation de privilèges ;
- scopes excessifs ;
- réutilisation idempotency key ;
- webhook forgé ;
- accès après révocation.

### 26.6 Résilience et charge

- plusieurs millions de transactions historiques ;
- webhook dupliqué/désordonné ;
- rate limit partenaire ;
- timeout ;
- provider partiellement indisponible ;
- reprise de sync ;
- campagne de réauthentification ;
- paiement avec réponse incertaine.

## 27. Ordre de développement

1. modèle de consentement et capacités ;
2. interfaces partenaires et provider mock ;
3. catalogue banques ;
4. connexion/auth/callback sécurisé ;
5. comptes et soldes ;
6. transactions, pagination, normalisation et déduplication ;
7. agrégation UI ;
8. révocation/réauthentification ;
9. admin/feature flags/kill switches ;
10. RBAC/ABAC, audit et conformité ;
11. Pricing & Commission Engine ;
12. initiation de paiement derrière feature flag ;
13. statut, ledger et rapprochement ;
14. fraude et step-up ;
15. Jini ;
16. observabilité ;
17. tests sécurité, résilience et charge ;
18. activation progressive banque par banque/pays par pays.

## 28. Critères d’acceptation

Le module est accepté lorsque :

- aucune banque/capacité n’est présentée comme disponible sans configuration réelle ;
- toute connexion possède un consentement versionné, limité et révocable ;
- les identifiants bancaires secrets ne sont pas collectés inutilement par MANSA ;
- comptes, soldes et transactions sont associés à une fraîcheur vérifiable ;
- les données externes restent distinguées des fonds détenus par MANSA ;
- les synchronisations sont idempotentes et reprenables ;
- la révocation bloque effectivement les nouveaux accès ;
- les permissions empêchent l’accès transversal aux données bancaires ;
- l’initiation de paiement est impossible si la capacité n’est pas autorisée ;
- les paiements utilisent authentification/consentement requis et sont protégés contre les doublons ;
- un statut incertain n’est jamais transformé en succès ou échec sans preuve ;
- les frais et commissions sont configurables depuis l’admin avec simulation, maker-checker, dates d’effet, versioning et snapshots historiques ;
- les webhooks sont signés, idempotents et anti-replay ;
- le mode réseau faible n’invente aucune donnée temps réel ;
- les secrets/tokens sont protégés et absents des logs ;
- les cas de fraude et incidents sont auditables ;
- les tests critiques fonctionnels, sécurité, résilience et charge passent ;
- les deux dépôts portent exactement la même spécification.