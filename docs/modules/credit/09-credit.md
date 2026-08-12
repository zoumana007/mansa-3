# 09 — Crédit

## 1. Objectif

Le module Crédit permet à MANSA d’orchestrer des parcours de financement distribués par un ou plusieurs partenaires financiers autorisés dans chaque pays. MANSA ne doit pas être codé comme prêteur par défaut : la plateforme fournit l’expérience utilisateur, la collecte de données et consentements, le routage vers les partenaires, la présentation des offres, la gestion des échéanciers, paiements, notifications, justificatifs, rapprochements et audits. Le rôle économique et réglementaire réel de chaque acteur doit être explicite, configurable et traçable.

Le module doit pouvoir servir plusieurs cas d’usage : crédit personnel, crédit équipement, crédit commerçant/TPE, avance de trésorerie, crédit scolaire, crédit agricole, financement facture, crédit véhicule, crédit habitat, BNPL ou autres produits autorisés. Chaque produit est activable par pays, partenaire, segment, canal et version réglementaire.

## 2. Principes directeurs

- Aucun crédit ne peut être proposé sans partenaire et configuration juridique/produit valides pour le pays.
- MANSA distingue clairement prêteur, distributeur, apporteur, collecteur, prestataire technique et assureur éventuel.
- Les offres, taux, frais, assurances, pénalités et coûts totaux sont fournis par des règles versionnées et présentés avant consentement.
- Aucun scoring opaque ne doit produire seul une décision irréversible lorsqu’une validation partenaire ou humaine est requise.
- Les données utilisées pour l’éligibilité sont minimisées, justifiées, consenties et auditées.
- Les décisions et changements de conditions sont historisés de manière immuable.
- Le moteur central de frais et commissions MANSA est utilisé pour tous les frais de service applicables sans modifier le code.

## 3. Périmètre fonctionnel

### 3.1 Découverte et simulation

L’utilisateur peut consulter les produits disponibles selon son pays, profil, devise, segment et partenaires actifs. Avant toute demande, il peut simuler : montant, durée, fréquence de remboursement, mensualité/échéance estimée, coût total, frais, assurance éventuelle, apport initial et date prévisionnelle de première échéance.

La simulation n’est pas une promesse de financement. Elle affiche une mention claire indiquant que l’offre finale dépend du partenaire et des vérifications réglementaires.

### 3.2 Demande de crédit

Parcours recommandé :

1. choix du produit ;
2. simulation ;
3. affichage des informations précontractuelles ;
4. consentements ;
5. collecte des données requises ;
6. KYC/KYB renforcé si nécessaire ;
7. pièces justificatives ;
8. calcul/collecte des indicateurs d’éligibilité ;
9. soumission au partenaire ;
10. décision ;
11. présentation de l’offre ferme ;
12. acceptation/signature ;
13. décaissement ;
14. suivi de l’échéancier ;
15. remboursement ;
16. clôture ou recouvrement.

### 3.3 Sources de données autorisées

Selon consentement et base légale : identité/KYC, historique MANSA, revenus déclarés, transactions pertinentes, activité commerçante, factures, salaires, données bancaires via Open Banking, données Mobile Money via partenaire, garanties, données d’entreprise, historique de remboursement et données externes autorisées.

Toute source doit être déclarée dans une `CreditDataSourcePolicy` avec finalité, durée de conservation, pays, consentement requis, champs autorisés et partenaire destinataire.

### 3.4 Éligibilité et scoring

Le module supporte plusieurs modes : règles simples, score interne d’aide à la décision, score partenaire, bureau de crédit, décision manuelle ou combinaison.

Les règles de scoring doivent être versionnées. Chaque décision conserve : version du modèle/règle, données utilisées, résultat, motifs normalisés, partenaire, horodatage, opérateur ou service ayant pris la décision.

MANSA doit être capable d’expliquer les principaux facteurs de décision dans les limites légales et contractuelles. Les attributs sensibles interdits ne doivent pas être utilisés.

### 3.5 Offres et contractualisation

Une offre contient au minimum : prêteur, produit, montant, devise, durée, taux applicable, coût total, échéancier, frais, assurance éventuelle, garanties, pénalités autorisées, modalités de remboursement, délai de validité, documents contractuels et canaux de support.

Les documents contractuels sont versionnés et reliés au consentement/signature de l’utilisateur. Une offre expirée ne peut pas être réactivée silencieusement.

### 3.6 Décaissement

Le décaissement peut être effectué vers wallet MANSA, compte bancaire, Mobile Money, commerçant/fournisseur ou autre canal autorisé. Le partenaire reste source de vérité pour l’autorisation du financement lorsque contractuellement prévu.

Le décaissement utilise un identifiant idempotent et un rapprochement partenaire afin d’éviter doubles versements.

### 3.7 Échéancier et remboursements

Le module gère : échéances fixes ou variables, mensualités, hebdomadaire, journalier ou autre fréquence, paiement manuel, prélèvement autorisé, remboursement anticipé partiel/total, paiement partiel, échéance manquée, rééchelonnement approuvé, moratoire, remboursement par tiers autorisé et clôture.

Chaque échéance possède un statut explicite : `SCHEDULED`, `DUE`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `WAIVED`, `RESTRUCTURED`, `CANCELLED`.

Le remboursement doit être alloué selon une règle versionnée : principal, intérêts, assurance, taxes, frais et pénalités autorisées.

### 3.8 Retards et recouvrement

Le système calcule les jours de retard et déclenche des workflows configurables : rappel doux, notification, appel Jini Voice si autorisé, mise en relation support, proposition de régularisation, transfert à une équipe partenaire ou à un prestataire autorisé.

Aucune pratique abusive ou harcelante ne doit être automatisée. Les fenêtres horaires, fréquence de contact, canaux et règles de recouvrement sont configurables par pays.

### 3.9 Restructuration

Un partenaire peut proposer un rééchelonnement, moratoire, réduction autorisée, refinancement ou plan de régularisation. Toute modification crée une nouvelle version du contrat/échéancier et conserve l’ancien historique.

## 4. Modèle de données principal

### `CreditProduct`
- id, tenantId, partnerId
- countryCode, currency
- type
- name, description
- minAmount, maxAmount
- minTerm, maxTerm
- repaymentFrequencies
- eligibilityPolicyId
- pricingPolicyId
- activeFrom, activeUntil
- status

### `CreditApplication`
- id, userId / organizationId
- productId, partnerId
- requestedAmount, requestedTerm
- purpose
- status
- currentStep
- submittedAt, decidedAt
- consentBundleVersion
- dataSnapshotRef

Statuts : `DRAFT`, `INCOMPLETE`, `SUBMITTED`, `UNDER_REVIEW`, `ADDITIONAL_INFO_REQUIRED`, `APPROVED`, `REJECTED`, `EXPIRED`, `CANCELLED`.

### `CreditAssessment`
- applicationId
- assessmentMode
- score / riskBand
- decision
- reasonCodes
- ruleVersion/modelVersion
- partnerDecisionRef
- assessedAt

### `CreditOffer`
- applicationId
- lenderPartnerId
- principal
- interestRate / pricing structure
- feesSnapshot
- insuranceSnapshot
- taxesSnapshot
- totalCost
- term
- validUntil
- contractDocumentRefs
- status

### `CreditContract`
- offerId
- lenderPartnerId
- borrowerId
- signedAt
- signatureEvidenceRef
- contractVersion
- principalOutstanding
- status

### `RepaymentSchedule`
- contractId
- version
- effectiveFrom
- totalInstallments
- status

### `Installment`
- scheduleId
- dueDate
- principalDue
- interestDue
- feeDue
- taxDue
- penaltyDue
- amountPaid
- status

### `CreditPayment`
- contractId
- installmentId
- transactionId
- amount
- currency
- channel
- allocationSnapshot
- idempotencyKey
- status

### `CreditDelinquencyCase`
- contractId
- daysPastDue
- stage
- ownerType
- lastContactAt
- nextActionAt
- hardshipFlag
- status

### `CreditConsent`
- subjectId
- purpose
- policyVersion
- grantedAt
- expiresAt
- revokedAt
- evidenceRef

### `CreditAuditEvent`
Journal append-only : acteur, action, ressource, ancienne/nouvelle valeur sensible sous forme de diff contrôlé, justification, IP/device si pertinent, correlationId, timestamp.

## 5. États du contrat

`PENDING_SIGNATURE`, `ACTIVE`, `GRACE_PERIOD`, `DELINQUENT`, `RESTRUCTURING`, `RESTRUCTURED`, `PAID_OFF`, `DEFAULTED`, `CANCELLED`, `WRITTEN_OFF`.

Les transitions sont contrôlées par machine à états. Aucune transition administrative sensible ne doit contourner l’audit et les permissions.

## 6. Pricing & Commission Engine

Le module Crédit consomme obligatoirement le moteur central de tarification. L’administration peut configurer, sans déploiement :

- frais fixes ;
- pourcentage ;
- fixe + pourcentage ;
- minimum/maximum ;
- paliers ;
- gratuité et quotas gratuits ;
- promotions temporaires ;
- commission MANSA ;
- commission partenaire ;
- commission agent ;
- commission apporteur ;
- taxes séparées ;
- pays, devise, canal, segment, type de crédit, partenaire et volume ;
- date d’effet et date de fin.

Important : distinguer les frais MANSA des intérêts, frais prêteur, assurance, taxes et pénalités contractuelles. MANSA ne doit jamais fusionner ces éléments dans un montant opaque.

Chaque simulation et contrat conserve un `pricingSnapshotId` immuable. Un changement tarifaire ultérieur n’altère pas les opérations historiques.

Workflow tarifaire : `DRAFT -> SIMULATED -> PENDING_APPROVAL -> SCHEDULED -> ACTIVE -> SUPERSEDED/EXPIRED`.

Les changements sensibles peuvent imposer double validation. La simulation d’impact doit afficher revenus MANSA, part partenaire, coûts, taxes et effet utilisateur avant publication.

## 7. RBAC / ABAC

Rôles indicatifs :

- `SUPER_ADMIN`
- `CREDIT_ADMIN`
- `CREDIT_PRODUCT_MANAGER`
- `RISK_ANALYST`
- `COMPLIANCE_OFFICER`
- `COLLECTION_AGENT`
- `SUPPORT_AGENT`
- `PARTNER_OPERATOR`
- `AUDITOR`
- `READ_ONLY_ANALYST`

ABAC : pays, partenaire, produit, segment, montant, niveau de risque, état du dossier, tenant, équipe et sensibilité des données.

Actions sensibles : modification d’une décision, restructuration, remise de frais, write-off, changement de partenaire, export de données, changement de pricing, accès à justificatifs et override manuel.

## 8. API internes et partenaires

Exemples d’API :

- `GET /credit/products`
- `POST /credit/simulations`
- `POST /credit/applications`
- `POST /credit/applications/:id/submit`
- `GET /credit/applications/:id`
- `POST /credit/applications/:id/documents`
- `POST /credit/applications/:id/consents`
- `GET /credit/applications/:id/offers`
- `POST /credit/offers/:id/accept`
- `GET /credit/contracts/:id`
- `GET /credit/contracts/:id/schedule`
- `POST /credit/contracts/:id/payments`
- `POST /credit/contracts/:id/prepayment-quote`
- `POST /credit/contracts/:id/restructure-request`
- `GET /credit/contracts/:id/statements`

Les adaptateurs partenaires exposent une interface commune : `submitApplication`, `requestDecision`, `fetchOffers`, `acceptOffer`, `requestDisbursement`, `fetchContract`, `fetchSchedule`, `postRepayment`, `fetchBalance`, `requestRestructure`, `closeContract`.

Chaque appel externe utilise timeout, retry borné, idempotence, circuit breaker, correlationId et journal de statut.

## 9. Webhooks

Événements sortants/internes :

- `credit.application.submitted`
- `credit.application.more_info_required`
- `credit.application.approved`
- `credit.application.rejected`
- `credit.offer.created`
- `credit.offer.expired`
- `credit.contract.signed`
- `credit.disbursement.completed`
- `credit.installment.due_soon`
- `credit.installment.paid`
- `credit.installment.overdue`
- `credit.restructure.proposed`
- `credit.contract.paid_off`

Webhooks signés, versionnés, rejouables, idempotents et avec dead-letter queue.

## 10. Feature flags

Exemples : `credit.enabled`, `credit.product.personal`, `credit.product.merchant`, `credit.partner.<id>`, `credit.scoring.internal`, `credit.open_banking_data`, `credit.mobile_money_data`, `credit.autopay`, `credit.early_repayment`, `credit.restructure`, `credit.jini_assistance`, `credit.jini_voice_reminders`.

Flags configurables par pays, tenant, partenaire, environnement et pourcentage de rollout.

## 11. Administration

Le portail Admin permet :

- gérer produits et partenaires ;
- configurer pays/devises ;
- visualiser le funnel de demande ;
- consulter dossiers selon permission ;
- traiter demandes de pièces ;
- suivre décisions et motifs ;
- suivre décaissements ;
- suivre portefeuille actif ;
- suivre impayés et vintage ;
- gérer restructurations ;
- configurer rappels ;
- configurer pricing et commissions ;
- simuler les changements tarifaires ;
- exporter rapports autorisés ;
- consulter journal d’audit.

## 12. Sécurité, conformité et fraude

- chiffrement en transit et au repos ;
- tokenisation des identifiants partenaires ;
- secrets dans gestionnaire dédié, jamais dans le dépôt ;
- MFA pour opérations administratives sensibles ;
- KYC/KYB selon produit ;
- AML et sanctions lorsque requis ;
- détection identité synthétique, multi-comptes, appareils suspects, documents falsifiés, vélocité anormale, fraude au décaissement et fraude au remboursement ;
- séparation des responsabilités ;
- contrôles anti-collusion agents/partenaires ;
- limites et step-up authentication ;
- aucun changement manuel de dette sans motif et audit.

## 13. Données et confidentialité

Collecter uniquement les données nécessaires au produit. Définir des durées de conservation par catégorie, pays et obligation réglementaire. Prévoir export utilisateur lorsque légalement applicable, rectification des données déclaratives, gestion du retrait de consentement lorsque possible et suppression/anonymisation à échéance lorsque la conservation n’est plus requise.

Les données de scoring et justificatifs sont cloisonnés. Les écrans support affichent uniquement les champs nécessaires à leur mission.

## 14. Multi-pays et multi-devises

Aucun taux, plafond, durée, pénalité ou produit n’est global par défaut. Chaque pays possède une `CreditCountryPolicy` : produits autorisés, partenaires, devise(s), règles de disclosure, KYC, conservation, recouvrement, plafonds, documents, jours fériés et règles d’arrondi.

Les contrats restent dans leur devise contractuelle. Toute conversion pour paiement doit être explicite, cotée avant confirmation et séparée du montant dû.

## 15. Réseau faible et hors ligne

Les simulations peuvent être mises en cache à titre indicatif avec date/heure de fraîcheur. Une demande peut être sauvegardée localement chiffrée en brouillon puis synchronisée.

Aucune acceptation contractuelle, décision finale, décaissement ou paiement ne doit être considéré définitif hors ligne sans accusé serveur/partenaire. Les requêtes de paiement utilisent des clés d’idempotence pour éviter les doubles débits lors de reconnexion.

## 16. Jini

Jini peut expliquer un produit, guider une demande, rappeler une échéance, résumer un contrat et orienter vers le support. Jini ne doit pas inventer d’éligibilité, taux, décision ou promesse de financement. Les réponses financières sensibles doivent être fondées sur les données du contrat/offre et les outils autorisés.

Jini Voice peut effectuer des rappels uniquement selon consentement, plages horaires et politiques de recouvrement applicables.

## 17. Observabilité et reporting

Métriques : taux de conversion, délai décision, approbation, décaissement, encours, remboursement à temps, DPD 1/7/30/60/90, restructurations, défauts, pertes, coût partenaire, revenus MANSA, commissions, fraude, taux d’erreur API, latence, reprises idempotentes.

Les métriques financières doivent être rapprochées avec le ledger et les rapports partenaire.

## 18. Résilience et rapprochement

Prévoir : outbox transactionnelle, queues, retry exponentiel borné, DLQ, circuit breakers, reprise après incident, jobs de rapprochement, détection des divergences, dashboard d’exception et résolution contrôlée.

Rapprochements minimum : application MANSA vs partenaire, décaissement vs ledger, échéancier partenaire vs MANSA, remboursement vs partenaire, frais/commissions vs pricing snapshot, soldes et clôtures.

## 19. Tests

### Fonctionnels
- simulation ;
- demande complète/incomplète ;
- demande de pièce ;
- approbation/rejet ;
- expiration offre ;
- signature ;
- décaissement ;
- remboursement complet/partiel ;
- remboursement anticipé ;
- retard ;
- restructuration ;
- clôture.

### Pricing
- fixe, %, fixe+% ;
- min/max ;
- paliers ;
- promotions ;
- taxe séparée ;
- commission partenaire/agent/apporteur ;
- historique préservé après changement de tarif.

### Sécurité
- IDOR ;
- élévation de privilèges ;
- abus d’override ;
- injection ;
- fuite documentaire ;
- rejeu webhook ;
- double décaissement/paiement ;
- fraude de compte.

### Performance et résilience
- pics de demandes ;
- panne partenaire ;
- timeout ;
- webhook dupliqué ;
- reconnexion réseau ;
- reprise queue ;
- rapprochement après incident.

## 20. Ordre de développement

1. contrats de domaine, statuts et policies pays ;
2. catalogue produits/partenaires ;
3. simulation + Pricing Engine ;
4. demandes + consentements + documents ;
5. adaptateurs partenaires ;
6. décision/offres ;
7. contractualisation ;
8. décaissement ;
9. échéancier/remboursement ;
10. retard/recouvrement/restructuration ;
11. admin/RBAC/ABAC ;
12. webhooks/observabilité/rapprochement ;
13. Jini ;
14. hardening sécurité, charge et DR.

## 21. Critères d’acceptation

Le module est considéré prêt lorsque :

- aucun crédit ne peut être activé sans partenaire/pays configuré ;
- les simulations et offres présentent les coûts de manière décomposée ;
- chaque décision est traçable et versionnée ;
- chaque contrat conserve son snapshot tarifaire ;
- les paiements/décaissements sont idempotents ;
- les doubles débits/décaissements sont détectés et empêchés ;
- les changements sensibles nécessitent les permissions adéquates et sont audités ;
- les frais/commissions sont modifiables depuis l’admin sans changement de code ;
- le multi-pays et multi-devises fonctionnent sans valeurs globales implicites ;
- les scénarios de panne partenaire et réseau faible sont couverts ;
- les rapprochements détectent les divergences ;
- les données sensibles sont minimisées et cloisonnées ;
- les tests fonctionnels, sécurité, performance et résilience passent ;
- la documentation n’affirme jamais qu’un partenaire, taux ou produit est disponible sans configuration contractuelle réelle.
