# 10 — Assurance

## 1. Objectif

Le module Assurance permet à MANSA de distribuer et d’orchestrer des produits d’assurance fournis par des assureurs, courtiers ou partenaires autorisés dans chaque pays. MANSA ne doit jamais être codé comme assureur par défaut : le porteur de risque, le distributeur, le courtier, l’encaisseur et le prestataire technique sont identifiés explicitement, configurables et auditables.

Le module couvre la découverte, comparaison, devis, souscription, paiement des primes, émission et conservation des documents, renouvellement, déclaration et suivi des sinistres, indemnisation, résiliation et support. Les produits sont activables par pays, devise, partenaire, segment et canal.

## 2. Produits supportés

Architecture générique permettant notamment : automobile/moto, habitation, voyage, santé complémentaire lorsque autorisée, scolaire, appareil/téléphone, marchandises, agriculture, récolte/bétail, commerçant/PME, transport, crédit emprunteur, micro-assurance et autres produits légalement distribuables.

Chaque produit doit préciser garanties, exclusions, plafonds, franchises, délais de carence, bénéficiaires, durée, conditions d’éligibilité, pièces requises, mode de tarification et documents contractuels versionnés.

## 3. Principes directeurs

- Aucun produit n’est visible sans partenaire autorisé et configuration pays valide.
- MANSA n’invente jamais une couverture, un tarif, une indemnisation ou une acceptation partenaire.
- Le consentement et les informations précontractuelles précèdent la souscription.
- Les données collectées sont limitées à ce qui est nécessaire au produit et à la réglementation.
- Les conditions appliquées à un contrat restent figées/versionnées pour son historique.
- Les décisions de sinistre provenant du partenaire sont distinguées des contrôles techniques MANSA.
- Le Pricing & Commission Engine central gère les frais MANSA et répartitions commerciales sans modification de code.

## 4. Parcours fonctionnels

### 4.1 Découverte et comparaison

L’utilisateur consulte uniquement les produits disponibles pour son pays/profil. Les fiches normalisent les éléments comparables : partenaire, garanties principales, exclusions essentielles, franchise, plafond, durée, prime estimée, fréquence, conditions et documents.

La comparaison ne doit pas masquer les différences contractuelles. Les classements sponsorisés sont explicitement identifiés.

### 4.2 Devis

Parcours : choix produit → informations nécessaires → consentements → calcul local ou requête partenaire → devis versionné → récapitulatif → documents précontractuels.

Un `InsuranceQuote` contient une date d’expiration et l’identifiant/version de tarification partenaire. Un devis expiré est recalculé, jamais réactivé silencieusement.

### 4.3 Souscription

Après acceptation du devis : KYC/KYB adapté au risque, déclarations, bénéficiaires, pièces, consentements, signature/acceptation, paiement initial si requis, transmission partenaire, confirmation, émission de police/certificat.

États : `DRAFT`, `QUOTED`, `AWAITING_DOCUMENTS`, `AWAITING_PAYMENT`, `SUBMITTED`, `PENDING_PARTNER`, `ACTIVE`, `REJECTED`, `EXPIRED`, `CANCELLED`.

MANSA n’affiche `ACTIVE` qu’après confirmation de la source de vérité prévue par le contrat partenaire.

### 4.4 Primes

Support : prime unique ou périodique, paiement manuel, mandat récurrent autorisé, wallet MANSA, carte, banque, Mobile Money ou autre rail activé. Une tentative possède une clé d’idempotence. Les paiements, remboursements et reversements sont rapprochés avec le ledger MANSA et le partenaire.

### 4.5 Documents

Coffre documentaire : devis, IPID/notice ou équivalent local, conditions, police, certificat, avenants, quittances, déclarations et pièces de sinistre. Chaque document possède version, émetteur, hash/intégrité, date d’effet et politique de conservation. Les documents sensibles utilisent contrôle d’accès et chiffrement appropriés.

### 4.6 Renouvellement et avenants

Rappels configurables avant échéance. Renouvellement automatique uniquement avec base contractuelle/consentement valide. Toute modification de véhicule, adresse, bénéficiaire, capital, garantie ou autre paramètre crée une demande d’avenant et une nouvelle version confirmée par le partenaire.

### 4.7 Sinistres

Parcours : sélectionner contrat → type/date/lieu → description → personnes/biens concernés → preuves/photos/documents → coordonnées de paiement si nécessaires → consentement → soumission → accusé de réception → instruction → demandes complémentaires → décision → indemnisation/recours/clôture.

États : `DRAFT`, `SUBMITTED`, `ACKNOWLEDGED`, `UNDER_REVIEW`, `INFO_REQUIRED`, `ASSESSED`, `APPROVED`, `PARTIALLY_APPROVED`, `REJECTED`, `PAYMENT_PENDING`, `PAID`, `CLOSED`, `CANCELLED`.

Une décision négative conserve motif normalisé, explication partenaire disponible et voie de recours/support.

### 4.8 Indemnisation

L’indemnisation peut être initiée par le partenaire vers wallet, banque, Mobile Money, prestataire/réparateur ou autre canal autorisé. MANSA conserve références, montant, devise, bénéficiaire, statut, rapprochement et preuve sans prétendre être le payeur lorsque ce n’est pas son rôle.

## 5. Modèle de données

Entités principales :

- `InsurancePartner`: id, tenantId, pays, rôles réglementaires, capacités, statut.
- `InsuranceProduct`: partnerId, type, pays, devise, garanties, exclusions, franchises, plafonds, éligibilité, versions, feature flags.
- `InsuranceQuote`: productId, customerId, riskSnapshotRef, premium, taxes, partnerFees, mansaFees, pricingVersion, expiresAt, status.
- `InsurancePolicy`: quoteId, partnerPolicyRef, holderId, insuredParties, beneficiaries, coverageStart/End, premiumScheduleId, status, contractVersion.
- `InsuranceCoverage`: policyId, code, limit, deductible, waitingPeriod, conditionsVersion.
- `InsurancePremiumSchedule`: policyId, frequency, installments, nextDueAt, mandateId.
- `InsurancePremiumPayment`: installmentId, paymentIntentId, ledgerRefs, pricingSnapshotId, status.
- `InsuranceClaim`: policyId, claimantId, type, occurredAt, declaredAt, status, partnerClaimRef, decisionReason.
- `InsuranceClaimEvidence`: claimId, documentRef, category, checksum, retentionPolicyId.
- `InsuranceClaimPayment`: claimId, amount, currency, beneficiary, rail, partnerReference, reconciliationStatus.
- `InsuranceDocument`, `InsuranceConsent`, `InsuranceBeneficiary`, `InsuranceEndorsement`, `InsuranceAuditEvent`.

Les références partenaires sont uniques dans leur namespace et ne servent jamais seules d’identifiant public.

## 6. Règles métier

- Une police ne devient active qu’après conditions contractuelles et confirmation requise.
- Une couverture est évaluée selon la version du contrat applicable à la date du sinistre.
- Aucun changement rétroactif de garantie ne modifie l’historique.
- Les primes encaissées sont séparées comptablement des revenus MANSA.
- Les remboursements, annulations et résiliations utilisent des workflows et motifs explicites.
- Les doublons de souscription/sinistre/paiement sont détectés par idempotence et règles de similarité.
- Les bénéficiaires et coordonnées de versement sensibles peuvent nécessiter step-up authentication.

## 7. Pricing & Commission Engine

Chaque opération tarifable appelle le moteur central. Configuration possible par produit, pays, devise, canal, segment, partenaire et période : montant fixe, pourcentage, fixe + %, minimum, maximum, paliers, gratuité, quotas gratuits, promotions et volume.

Répartition configurable : MANSA, agent, commerçant/distributeur, partenaire, apporteur et taxes séparées. Les primes d’assurance et taxes réglementaires restent distinguées des frais de service MANSA.

Cycle : `DRAFT → SIMULATED → APPROVAL_REQUIRED → SCHEDULED → ACTIVE → RETIRED`. Toute modification sensible est approuvée selon maker-checker et auditée. Chaque devis/paiement conserve un `pricingSnapshot` immuable avec règles, version, montants et bénéficiaires de commission réellement appliqués.

## 8. RBAC / ABAC

Rôles types : client, bénéficiaire autorisé, support, opérateur assurance, gestionnaire sinistre, finance/réconciliation, conformité, fraude, admin pays, super admin, partenaire via scopes techniques.

ABAC prend en compte tenant, pays, partenaire, produit, portefeuille attribué, niveau KYC, sensibilité documentaire et finalité. Un agent support ne voit pas automatiquement les données médicales ou pièces de sinistre sensibles. Les actions critiques (remboursement, changement bénéficiaire, override, export sensible, modification tarifaire) nécessitent permission dédiée et éventuellement maker-checker.

## 9. API et webhooks

API versionnée : catalogue, devis, souscriptions, polices, documents, primes, paiements, avenants, sinistres, preuves, décisions, indemnisations, résiliations et administration.

Connecteurs derrière interfaces : `InsuranceCatalogProvider`, `QuoteProvider`, `PolicyProvider`, `ClaimsProvider`, `InsurancePaymentProvider`. Aucun fournisseur n’est codé en dur.

Webhooks entrants signés, horodatés, anti-replay et idempotents. Événements sortants : `insurance.quote.created`, `policy.activated`, `premium.due`, `premium.paid`, `claim.submitted`, `claim.info_required`, `claim.decision_received`, `claim.payment_updated`, `policy.expiring`, `policy.cancelled`. Retries avec backoff et dead-letter queue.

## 10. Feature flags et administration

Activation par pays/tenant/produit/partenaire/canal : comparaison, souscription, autopay, sinistres numériques, upload photo, Jini, renouvellement, type d’assurance et rail de paiement.

Admin : partenaires, produits, versions contractuelles, règles d’éligibilité, documents requis, SLA, templates de notification, frais/commissions, limites, motifs, rétention, webhooks, rapprochements, incidents et dashboards.

## 11. Sécurité, conformité, fraude et données

KYC/KYB/AML selon rôle et flux. Chiffrement en transit/au repos, secrets en coffre, URLs documentaires temporaires, antivirus/validation des fichiers, step-up pour opérations à risque, journal d’audit append-only.

Fraude : identité incohérente, multi-souscriptions anormales, sinistres répétés, preuves dupliquées, métadonnées suspectes, changement récent de bénéficiaire, vélocité, appareils/comptes liés. Les règles produisent score/alerte/revue et ne falsifient jamais une décision partenaire.

Minimisation stricte. Les données de santé, lorsqu’un produit en exige légalement, sont isolées avec accès au besoin d’en connaître, finalité, consentement/base légale et rétention spécifiques. Export/suppression respectent obligations contractuelles, comptables et réglementaires.

## 12. Multi-pays et multi-devises

`countryCode`, `currency`, timezone, locale et version réglementaire sont explicites. Catalogue, documents, taxes, règles, partenaires et capacités varient par pays. Aucun produit d’un pays ne fuit dans un autre tenant/périmètre. Conversion de devise seulement si un flux contractuel l’autorise ; taux et marge sont snapshotés.

## 13. Réseau faible et hors ligne

Consultation de documents déjà téléchargés possible selon politique locale. Création de brouillon de sinistre et capture de preuves peuvent être mises en file chiffrée localement puis synchronisées. Aucune activation de police, confirmation de paiement ou décision de sinistre n’est inventée hors ligne. Synchronisation idempotente, checksum des pièces, résolution de conflits et purge locale après upload confirmé.

## 14. Jini

Jini peut expliquer garanties, échéances et étapes avec données autorisées, aider à constituer un dossier, rappeler une prime ou demander une pièce. Il ne promet jamais couverture, acceptation ou indemnisation et n’interprète pas une clause comme décision juridique définitive. Toute action transactionnelle requiert Skill autorisé, contexte tenant, permission et confirmation adaptée.

## 15. Audit, ledger et rapprochement

Auditer consentements, devis, souscriptions, changements de police, paiements, remboursements, sinistres, décisions reçues, indemnisations, accès sensibles, exports et overrides.

Le ledger sépare prime, taxe, frais MANSA, commissions et règlement partenaire. Rapprochement quotidien ou événementiel entre ledger MANSA, PSP/rail et partenaire assurance. Écarts classés, assignés et résolus sans modification destructive de l’historique.

## 16. Performance et résilience

Cache contrôlé pour catalogue public/non sensible ; pas de cache incohérent pour statut contractuel. Timeouts, circuit breakers, retries sûrs, idempotence, outbox/inbox, files asynchrones pour documents/webhooks. Dégradation gracieuse si partenaire indisponible : consultation locale autorisée, nouvelle demande mise en attente ou bloquée explicitement, jamais fausse confirmation.

## 17. Tests

- unitaires : éligibilité, statuts, pricing, échéances, allocations ;
- contrats : adapters partenaires et webhooks ;
- intégration : devis→police→prime→renouvellement ; sinistre→décision→paiement ;
- E2E : parcours client/admin/partenaire ;
- sécurité : IDOR, RBAC/ABAC, upload malveillant, replay, signature webhook, accès documents ;
- fraude : doublons et vélocité ;
- résilience : timeout partenaire, webhook dupliqué/désordonné, reprise ;
- multi-pays : isolation et catalogue ;
- pricing : versioning, maker-checker et snapshot historique ;
- charge : catalogue, échéances et campagnes de renouvellement.

## 18. Ordre de développement

1. contrats métier, statuts et feature flags ;
2. partenaires/adapters mock et catalogue ;
3. devis et souscription ;
4. documents et consentements ;
5. primes/paiements/ledger/rapprochement ;
6. polices, avenants, renouvellements ;
7. sinistres et preuves ;
8. décisions/indemnisations ;
9. admin, RBAC/ABAC, audit et fraude ;
10. Pricing Engine central ;
11. Jini et notifications ;
12. tests de résilience, sécurité et charge ;
13. activation progressive par pays et partenaire.

## 19. Critères d’acceptation

Le module est acceptable lorsque : aucun produit n’est proposé sans configuration partenaire/pays ; devis et contrats sont versionnés ; activation et décisions reflètent la source de vérité contractuelle ; paiements sont idempotents et rapprochables ; sinistres ont un workflow traçable ; documents sensibles sont protégés ; permissions empêchent l’accès transversal non autorisé ; fonctionnement dégradé ne crée aucune fausse confirmation ; frais et commissions sont modifiables depuis l’admin avec simulation, approbation, dates d’effet et snapshots historiques ; les tests critiques passent ; les deux dépôts portent exactement la même spécification.