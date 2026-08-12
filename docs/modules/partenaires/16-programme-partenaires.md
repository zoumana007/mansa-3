# 16 — Programme partenaires

## 1. Objectif

Le module **Programme partenaires** fournit à MANSA un cadre unique pour recruter, qualifier, contractualiser, activer, rémunérer, superviser et auditer des partenaires commerciaux, techniques, institutionnels et de distribution sans coder en dur un acteur externe. Il doit couvrir les apporteurs d’affaires, agents, marchands référents, intégrateurs, revendeurs, partenaires technologiques, banques, Mobile Money, assureurs, prêteurs, fournisseurs d’investissement, téléphonie, administrations, places de marché, cabinets, associations et autres partenaires autorisés selon le pays.

Le module ne considère jamais qu’un service externe est disponible tant qu’un contrat réel, une autorisation réglementaire et une configuration de production n’existent pas. Toutes les intégrations financières, télécoms, bancaires, crypto, assurance, crédit, bourse ou autres restent abstraites derrière des adaptateurs configurables.

Objectifs principaux :

- disposer d’un registre partenaire multi-pays et multi-entités ;
- gérer l’onboarding KYB/KYC partenaire et les validations internes ;
- gérer contrats, offres, droits, territoires, produits autorisés et canaux ;
- créer des programmes d’apport, distribution, revente, intégration ou co-marketing ;
- attribuer des prospects et clients de façon traçable ;
- calculer commissions, rétrocessions et bonus via le moteur tarifaire central ;
- éviter double attribution, auto-référencement, fraude, collusion et conflits d’intérêts ;
- gérer règlements, réserves, ajustements, reprises et rapprochement ;
- fournir portail partenaire, API, webhooks et reporting ;
- garantir versioning, audit immuable et conservation des règles réellement appliquées.

---

## 2. Types de partenaires

Le modèle doit permettre au minimum :

- `REFERRAL_PARTNER` — apporteur d’affaires ;
- `AGENT` — agent de distribution ou de service ;
- `MERCHANT_PARTNER` — commerçant ou réseau de commerçants référent ;
- `RESELLER` — revendeur ;
- `DISTRIBUTOR` — distributeur ;
- `INTEGRATOR` — intégrateur technique ;
- `TECHNOLOGY_PROVIDER` — fournisseur technologique ;
- `FINANCIAL_PROVIDER` — banque, établissement de paiement ou autre acteur financier abstrait ;
- `MOBILE_MONEY_PROVIDER` ;
- `INSURANCE_PROVIDER` ;
- `CREDIT_PROVIDER` ;
- `INVESTMENT_PROVIDER` ;
- `TELEPHONY_PROVIDER` ;
- `PUBLIC_INSTITUTION` ;
- `MARKETPLACE_PARTNER` ;
- `AFFILIATE` ;
- `STRATEGIC_PARTNER` ;
- `OTHER`.

Un partenaire peut cumuler plusieurs catégories si les droits sont explicitement accordés.

---

## 3. Principes non négociables

1. Aucun partenaire n’accède à des données client au-delà du strict nécessaire.
2. Aucun partenaire n’est activé en production sans validation KYB/KYC, conformité, contrat et permissions.
3. Aucun secret partenaire ne doit être stocké en clair ni commité.
4. Aucun partenaire ne peut modifier ses propres commissions, règles d’attribution ou statuts de règlement.
5. Les changements sensibles suivent séparation des rôles et approbation si configurée.
6. Toute transaction historique conserve la règle, le tarif, la commission, la taxe et la version effectivement appliqués.
7. L’attribution d’un client ou d’un revenu doit être déterministe, explicable et auditable.
8. Les corrections utilisent des écritures d’ajustement ; on ne réécrit pas l’historique financier.
9. Un partenaire suspendu ne peut générer de nouveaux droits financiers après la date effective, sauf règlement d’encours légitime.
10. Les environnements Démo, Recette et Production sont séparés.
11. Les paiements et règlements externes sont idempotents et réconciliables.
12. Le moteur de commissions doit être configurable depuis l’administration sans modification de code.
13. Les programmes sont activables par pays, devise, canal, produit et catégorie de partenaire.
14. Les règles réglementaires locales priment sur la configuration commerciale.
15. Les données minimisées, la durée de conservation et la résidence des données sont configurables par juridiction.

---

## 4. Périmètre fonctionnel

### 4.1 Registre partenaire

Chaque partenaire possède : identité légale, nom commercial, pays, juridiction, adresses, responsables, bénéficiaires effectifs si requis, contacts, catégories, statuts, produits autorisés, territoires, devise de règlement, compte ou instrument de règlement abstrait, préférences de notification, niveau de risque, pièces, contrats, intégrations et historique.

### 4.2 Onboarding et KYB/KYC

Parcours :

1. invitation ou candidature ;
2. création du dossier ;
3. collecte minimisée des données ;
4. dépôt de pièces ;
5. contrôles KYB/KYC/AML/sanctions selon pays et type ;
6. scoring de risque ;
7. revue conformité ;
8. revue commerciale ;
9. contractualisation ;
10. paramétrage programme et tarifs ;
11. activation en Recette ;
12. tests ;
13. approbation Production ;
14. activation.

### 4.3 Programmes partenaires

Un `PartnerProgram` définit :

- nom et code ;
- type de programme ;
- objectif ;
- pays et territoires ;
- produits et services éligibles ;
- catégories de partenaires ;
- segment client ;
- canaux autorisés ;
- dates de début/fin ;
- règles d’attribution ;
- fenêtres d’attribution ;
- règles tarifaires ;
- commissions ;
- bonus ;
- seuils ;
- réserves ;
- règles de reprise ;
- taxes ;
- SLA ;
- critères qualité ;
- limites et exclusions ;
- état ;
- version.

Types : apport, affiliation, distribution, revente, agent, intégration, volume, co-marketing, marketplace, institutionnel, stratégique.

### 4.4 Prospects et attribution

Le module gère :

- lien/coderef partenaire ;
- QR partenaire ;
- campagne ;
- invitation ;
- attribution manuelle contrôlée ;
- import qualifié ;
- attribution API ;
- source et sous-source ;
- date de première interaction ;
- fenêtre d’attribution ;
- priorité entre sources ;
- déduplication ;
- transfert de propriété avec approbation ;
- litige d’attribution ;
- preuve d’attribution.

Interdire par défaut auto-référencement, boucles circulaires et attribution à un compte contrôlé par le même bénéficiaire effectif, sauf politique explicitement autorisée.

### 4.5 Portail partenaire

Le portail permet selon permissions :

- profil et conformité ;
- contrats ;
- programmes actifs ;
- liens/QR/codes ;
- prospects et clients attribués avec données minimisées ;
- statut des conversions ;
- volume admissible ;
- commissions estimées, acquises, réservées, annulées, réglées ;
- relevés ;
- factures ou pièces requises ;
- règlements ;
- tickets ;
- documents ;
- clés/API uniquement si rôle technique autorisé ;
- webhooks ;
- environnement sandbox ;
- alertes et notifications.

### 4.6 Contrats et gouvernance

Le module doit gérer : contrat, avenants, version, signataires, date d’effet, expiration, renouvellement, suspension, résiliation, territoire, produits, obligations, SLA, plafonds, données accessibles, rétention, partage de revenus, taxes, règlement, clauses de reprise et documents de conformité.

Aucune signature cryptographique ou valeur juridique n’est supposée disponible sans fournisseur ou mécanisme contractuel conforme.

---

## 5. Moteur de frais et commissions

Le programme partenaires consomme obligatoirement le moteur transversal de pricing et commissions. L’administration peut configurer sans code :

- frais fixe ;
- pourcentage ;
- fixe + pourcentage ;
- minimum ;
- maximum ;
- paliers ;
- gratuité ;
- nombre d’opérations gratuites ;
- promotions ;
- pays ;
- devise ;
- canal ;
- type d’utilisateur ;
- type de partenaire ;
- partenaire précis ;
- produit ;
- volume ;
- tranche de volume ;
- ancienneté ;
- acquisition ou rétention ;
- commission MANSA ;
- commission agent ;
- commission commerçant ;
- commission partenaire ;
- commission apporteur ;
- taxes séparées ;
- date d’effet ;
- date de fin ;
- simulation avant publication ;
- approbation des changements sensibles ;
- versioning tarifaire ;
- audit immuable.

Le moteur produit un `PricingSnapshot` figé pour chaque opération éligible.

Une commission peut être : estimée, conditionnelle, acquise, en réserve, payable, payée, annulée, reprise ou en litige.

Les formules ne doivent jamais être du code arbitraire exécuté côté administration. Utiliser un DSL ou ensemble de conditions/opérateurs bornés et validés.

---

## 6. Modèle de données

### 6.1 Partner

- `id` ;
- `organizationId` ;
- `legalName` ;
- `tradeName` ;
- `partnerTypes[]` ;
- `countryCode` ;
- `jurisdictionCode` ;
- `defaultCurrency` ;
- `status` ;
- `riskLevel` ;
- `complianceStatus` ;
- `contractStatus` ;
- `settlementProfileId` ;
- `parentPartnerId` optionnel ;
- `createdAt` ;
- `updatedAt`.

### 6.2 PartnerUser

- `id` ; `partnerId` ; `userId` ; `roleIds[]` ; `status` ; `mfaRequired` ; `lastLoginAt`.

### 6.3 PartnerProgram

- `id` ; `code` ; `name` ; `programType` ; `countries[]` ; `currencies[]` ; `channels[]` ; `productScopes[]` ; `eligibilityPolicyId` ; `attributionPolicyId` ; `pricingPolicyId` ; `startsAt` ; `endsAt` ; `status` ; `version`.

### 6.4 PartnerEnrollment

- `id` ; `partnerId` ; `programId` ; `status` ; `effectiveFrom` ; `effectiveTo` ; `approvedBy` ; `pricingOverridePolicyId` optionnel.

### 6.5 Referral

- `id` ; `programId` ; `partnerId` ; `sourceType` ; `sourceRef` ; `leadRef` ; `customerRef` pseudonymisé si possible ; `attributedAt` ; `expiresAt` ; `status` ; `evidenceRef` ; `decisionVersion`.

### 6.6 ConversionEvent

- `id` ; `referralId` ; `eventType` ; `productType` ; `transactionRef` ; `grossAmount` ; `currency` ; `eligibleAmount` ; `occurredAt` ; `status`.

### 6.7 PartnerCommission

- `id` ; `partnerId` ; `programId` ; `conversionEventId` ; `pricingSnapshotId` ; `grossBase` ; `commissionAmount` ; `taxAmount` ; `netAmount` ; `currency` ; `status` ; `reserveUntil` ; `payableAt` ; `reversalOfId` optionnel.

### 6.8 PartnerSettlement

- `id` ; `partnerId` ; `periodStart` ; `periodEnd` ; `currency` ; `grossCommission` ; `taxes` ; `adjustments` ; `netPayable` ; `settlementInstrumentRef` ; `status` ; `providerReference` ; `reconciliationStatus`.

### 6.9 PartnerContract

- `id` ; `partnerId` ; `version` ; `documentRef` ; `effectiveFrom` ; `effectiveTo` ; `status` ; `approvedBy` ; `signedAt`.

### 6.10 PartnerIntegration

- `id` ; `partnerId` ; `adapterType` ; `environment` ; `configRef` ; `secretRef` ; `status` ; `lastHealthCheckAt`.

---

## 7. États et statuts

### Partner
`DRAFT`, `PENDING_REVIEW`, `PENDING_COMPLIANCE`, `PENDING_CONTRACT`, `SANDBOX`, `ACTIVE`, `RESTRICTED`, `SUSPENDED`, `TERMINATED`, `ARCHIVED`.

### Enrollment
`DRAFT`, `PENDING_APPROVAL`, `ACTIVE`, `PAUSED`, `EXPIRED`, `REVOKED`.

### Referral
`CREATED`, `ATTRIBUTED`, `QUALIFIED`, `CONVERTED`, `EXPIRED`, `REJECTED`, `DISPUTED`, `CANCELLED`.

### Commission
`ESTIMATED`, `CONDITIONAL`, `EARNED`, `RESERVED`, `PAYABLE`, `PAID`, `CANCELLED`, `REVERSED`, `DISPUTED`.

### Settlement
`DRAFT`, `CALCULATED`, `PENDING_APPROVAL`, `APPROVED`, `PROCESSING`, `PAID`, `PARTIALLY_PAID`, `FAILED`, `RECONCILING`, `RECONCILED`, `DISPUTED`.

Transitions invalides refusées côté domaine et auditées.

---

## 8. Règles métier

- une conversion ne génère qu’une seule commission primaire par programme sauf partage explicitement configuré ;
- le partage multi-partenaire doit être borné et totaliser une valeur cohérente ;
- une commission peut dépendre d’un délai de confirmation ou de non-rétractation ;
- remboursement, chargeback, annulation ou fraude peuvent déclencher une reprise selon la règle historique ;
- une reprise après paiement crée une créance ou compensation future, jamais une suppression d’écriture ;
- tout override tarifaire a une durée et une approbation ;
- les plafonds journaliers/mensuels/annuels peuvent s’appliquer ;
- les commissions peuvent être calculées sur montant brut, net, marge ou unité, selon règle explicite ;
- les taxes sont des lignes distinctes ;
- les devises sont conservées dans leur devise d’origine ; conversion de règlement seulement via règle FX versionnée ;
- aucun arrondi implicite : précision et mode d’arrondi par devise ;
- les hiérarchies distributeur/sous-agent sont autorisées uniquement si le programme le permet ;
- interdiction de rémunérer une activité non autorisée localement ;
- conservation d’un justificatif de calcul pour chaque commission.

---

## 9. RBAC / ABAC

Rôles internes possibles : `PARTNER_ADMIN`, `PARTNER_COMPLIANCE`, `PARTNER_SALES_OPS`, `PARTNER_FINANCE`, `PARTNER_SUPPORT`, `PARTNER_AUDITOR`, `PARTNER_TECH_ADMIN`, `SUPER_ADMIN`.

Rôles côté partenaire : `OWNER`, `ADMIN`, `FINANCE`, `SALES`, `TECHNICAL`, `VIEWER`, `AUDITOR`.

Attributs ABAC : pays, organisation, partnerId, programId, produit, environnement, montant, niveau de risque, statut conformité, territoire, devise.

Séparer au minimum création de tarif, approbation de tarif, validation conformité, déclenchement règlement et rapprochement.

---

## 10. API

Exemples :

- `POST /partners` ;
- `GET /partners/:id` ;
- `PATCH /partners/:id` ;
- `POST /partners/:id/submit-review` ;
- `POST /partners/:id/activate` ;
- `POST /partners/:id/suspend` ;
- `GET /partner-programs` ;
- `POST /partner-programs` ;
- `POST /partner-programs/:id/enrollments` ;
- `POST /referrals` ;
- `GET /referrals/:id` ;
- `POST /referrals/:id/disputes` ;
- `GET /partner-commissions` ;
- `POST /partner-settlements/calculate` ;
- `POST /partner-settlements/:id/approve` ;
- `POST /partner-settlements/:id/execute` ;
- `GET /partner-statements` ;
- `POST /partner-integrations` ;
- `POST /partner-integrations/:id/test`.

Toutes les écritures sensibles : idempotency key, auth forte, scopes, validation schéma, rate limiting et audit.

---

## 11. Webhooks

Événements possibles :

- `partner.created` ;
- `partner.reviewed` ;
- `partner.activated` ;
- `partner.suspended` ;
- `partner.contract.expiring` ;
- `program.enrollment.activated` ;
- `referral.attributed` ;
- `referral.converted` ;
- `commission.earned` ;
- `commission.reversed` ;
- `settlement.approved` ;
- `settlement.paid` ;
- `settlement.failed` ;
- `integration.degraded`.

Signature, horodatage, identifiant unique, retries exponentiels, DLQ, replay contrôlé, rotation des secrets, logs sans données sensibles.

---

## 12. Feature flags

Flags par pays, partenaire, programme et environnement : portail partenaire, referrals, sous-agents, règlements automatiques, réserves, API partenaire, webhooks, co-marketing, partage multi-partenaire, attribution manuelle, override tarifaire, imports, sandbox, hiérarchies, FX de règlement.

Un flag désactivé doit fermer l’API et l’UI correspondantes sans supprimer les données historiques.

---

## 13. Administration

L’admin doit permettre :

- recherche et segmentation partenaires ;
- revue KYB/KYC ;
- risques et alertes ;
- contrats ;
- programmes ;
- adhésions ;
- territoires ;
- produits autorisés ;
- tarifs et commissions ;
- simulation avant publication ;
- workflow d’approbation ;
- litiges ;
- réserves ;
- règlements ;
- ajustements ;
- rapprochement ;
- intégrations ;
- webhooks ;
- SLA ;
- reporting ;
- export auditable ;
- historique immuable des changements.

---

## 14. Sécurité, conformité et fraude

Contrôles : MFA, moindre privilège, chiffrement, secret manager, rotation, device/session risk, IP allowlist optionnelle, rate limiting, détection de comptes liés, bénéficiaires effectifs communs, auto-référencement, création massive de faux prospects, commissions anormales, pics de conversion, conversions circulaires, multi-comptes, collusion agent-commerçant, réutilisation d’appareil, anomalies géographiques, remboursements opportunistes, manipulation de fenêtres d’attribution et fraude documentaire.

Les contrôles peuvent bloquer, mettre en réserve, demander revue ou suspendre. Une décision automatique sensible conserve motifs, règles, version et possibilité de revue humaine.

---

## 15. Audit

Journal immuable pour : création/modification partenaire, conformité, contrats, rôle, accès, programme, tarif, simulation, publication, attribution, override, litige, calcul commission, ajustement, réserve, règlement, rapprochement, changement d’intégration, secret metadata, suspension et réactivation.

Chaque entrée : acteur, rôle, tenant, partnerId, objet, action, avant/après minimisé, timestamp, correlationId, appareil/session, politique/version, motif et approbateur si applicable.

---

## 16. Multi-pays et multi-devises

- politiques de programme par juridiction ;
- règles KYB/KYC et conservation par pays ;
- devise de transaction distincte de devise de commission et règlement ;
- FX via moteur multi-devises versionné ;
- taxes séparées par juridiction ;
- disponibilité produit et catégorie partenaire par pays ;
- calendriers et jours fériés de règlement configurables ;
- formats locaux et langues ;
- résidence et transfert international des données selon politique.

Aucune conversion forcée si un règlement multi-devise est supporté.

---

## 17. Réseau faible / hors ligne

Le portail partenaire privilégie cache lecture, files locales chiffrées et reprise des uploads. Les créations de prospects peuvent être préparées hors ligne avec identifiant local puis synchronisées, mais l’attribution officielle n’existe qu’après validation serveur. Aucun calcul de commission, activation partenaire, modification de contrat, tarif ou règlement n’est définitif hors ligne.

Les opérations terrain utilisent nonce, expiration, limites et synchronisation anti-duplication lorsque nécessaire.

---

## 18. Intégrations partenaires abstraites

Interfaces recommandées :

- `PartnerIdentityProvider` ;
- `PartnerKybProvider` ;
- `PartnerScreeningProvider` ;
- `PartnerContractProvider` ;
- `PartnerSettlementProvider` ;
- `PartnerTaxProvider` ;
- `PartnerNotificationProvider` ;
- `PartnerCrmProvider` ;
- `PartnerAnalyticsProvider` ;
- `PartnerWebhookAdapter`.

Chaque adaptateur possède modes `MOCK`, `SANDBOX`, `PRODUCTION`, capacités déclarées, health-check, timeout, retry, circuit breaker, idempotence et observabilité.

---

## 19. Reporting et BI

Indicateurs : partenaires actifs, pipeline, activation, conversion, volume, revenu MANSA, coût commission, marge, CAC partenaire, taux de reprise, fraude, réserves, règlements en retard, SLA, concentration par partenaire, pays, produit, canal, cohorte et campagne.

Les exports financiers sont réconciliables avec les écritures de commission et settlement.

---

## 20. Tests

### Fonctionnels
Onboarding, approbation, suspension, programmes, attribution, déduplication, conversion, commission, réserve, reprise, litige, règlement, hiérarchie et expiration.

### Pricing
Fixe, %, fixe+%, min/max, paliers, gratuité, volume, promotions, taxes, split, dates d’effet, version historique, simulation et approval.

### Sécurité
Escalade de privilèges, IDOR, isolation tenant/partner, secrets, MFA, replay webhook, injection, rate limit, session, export massif.

### Fraude
Auto-référencement, boucle, multi-compte, collusion, volume artificiel, chargeback, attribution tardive, override illégal.

### Performance
Listes paginées, calcul batch de commissions, settlement volumineux, webhooks et reporting.

### Résilience
Timeout partenaire, double événement, retry, crash pendant règlement, reprise après incident, indisponibilité FX, webhook en échec, file DLQ.

---

## 21. Performance et résilience

- idempotence sur referrals, conversions, commissions, règlements ;
- calcul asynchrone pour batch ;
- verrous ou contraintes uniques sur attribution et commission ;
- queues durables ;
- retries bornés ;
- circuit breakers ;
- DLQ ;
- reconciliation jobs ;
- observabilité traces/métriques/logs ;
- cache uniquement sur données non sensibles compatibles ;
- RPO/RTO définis selon criticité ;
- sauvegardes et restauration testées.

---

## 22. Ordre de développement

1. modèles Partner, PartnerUser, Contract et RBAC ;
2. onboarding/KYB et statuts ;
3. PartnerProgram + Enrollment ;
4. attribution/referral ;
5. intégration Pricing Engine et snapshots ;
6. commission ledger ;
7. réserves, reprises et litiges ;
8. settlements et rapprochement ;
9. portail partenaire ;
10. API/webhooks ;
11. intégrations abstraites ;
12. fraude et risk controls ;
13. reporting ;
14. réseau faible ;
15. tests de sécurité, performance et résilience ;
16. pilote Recette puis activation Production contrôlée.

---

## 23. Critères d’acceptation

Le module est accepté lorsque :

1. un partenaire peut être onboardé, vérifié, contractualisé et activé sans code spécifique ;
2. aucun partenaire Production non conforme ne peut utiliser les capacités sensibles ;
3. les programmes sont configurables par pays, produit, canal et dates ;
4. l’attribution est dédupliquée, versionnée et explicable ;
5. toutes les commissions utilisent le moteur tarifaire configurable ;
6. fixe, %, combinaison, min/max, paliers, gratuité, promotions, volumes et taxes sont testés ;
7. une transaction historique garde son `PricingSnapshot` ;
8. les changements tarifaires sensibles peuvent nécessiter approbation ;
9. les commissions et reprises forment un ledger auditable ;
10. les règlements sont idempotents et réconciliables ;
11. l’isolation partenaire/tenant passe les tests d’autorisation ;
12. les secrets ne sont jamais exposés ni commitées ;
13. les webhooks sont signés et rejouables de manière contrôlée ;
14. le mode hors ligne ne crée aucun droit financier définitif ;
15. les données personnelles exposées au partenaire sont minimisées ;
16. les intégrations externes restent abstraites et configurables ;
17. aucun partenaire bancaire, Mobile Money, crédit, assurance, bourse, crypto ou téléphonie n’est présenté comme actif sans contrat réel ;
18. les tests fonctionnels, sécurité, fraude, performance et résilience sont verts ;
19. l’administration fournit simulation, versioning et audit des règles ;
20. les exports de commissions correspondent aux settlements et au rapprochement financier.

---

## 24. Dépendances

Le module dépend des briques MANSA : identité, organisations, RBAC/ABAC, KYC/KYB/AML, audit global, fraude/risque, notifications, documents, ledger, paiements, change/multi-devises, API développeurs, reporting et futur **Pricing & Commission Engine central** du module 20.

Jusqu’à la formalisation finale du module 20, toute implémentation doit respecter le contrat transversal décrit ici et éviter toute logique tarifaire codée localement dans le module partenaires.
