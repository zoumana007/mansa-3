# 15 — Modules État complémentaires

## 1. Objectif

Le module **Modules État complémentaires** étend le socle public déjà défini dans `112-secteur-public-services-etat.md` sans le dupliquer. Il ajoute les briques nécessaires pour faire de MANSA une plateforme d’orchestration des services financiers, administratifs et opérationnels de l’État, des collectivités et des établissements publics, tout en conservant une architecture partenaire, réglementaire et institutionnelle totalement abstraite.

Ce module ne transforme pas MANSA en logiciel souverain unique de l’État. Il fournit des capacités interopérables permettant à une administration habilitée de publier des services, recevoir ou décaisser des fonds, piloter des programmes, gérer des droits, contrôler des agents, rapprocher des flux, tracer des décisions et exposer des interfaces sécurisées à des systèmes publics existants.

Toute capacité fiscale, bancaire, Mobile Money, identité nationale, registre administratif, éducation, santé, justice, transport, douane, paie publique, subvention, aide sociale ou autre dépendance institutionnelle doit rester configurable derrière des interfaces partenaires. Aucun service ne doit être présenté comme disponible en production sans contrat, autorisation, conformité et intégration réelle.

---

## 2. Relation avec le module public existant

Le document `112-secteur-public-services-etat.md` constitue le socle pour :

- organisations publiques ;
- agents ;
- services publics ;
- obligations de paiement ;
- amendes ;
- taxes et redevances ;
- paiements scolaires et universitaires ;
- bourses et aides ;
- cartes étudiantes ;
- paiements sur place et à distance ;
- reçus ;
- remboursements ;
- contestations ;
- rapprochement et règlement ;
- API et webhooks.

Le présent module ajoute principalement :

- portail citoyen et dossier administratif transversal ;
- catalogue multi-administrations ;
- droits, licences, permis, autorisations et titres ;
- programmes sociaux et aides ciblées avancées ;
- subventions et décaissements publics ;
- marchés publics et paiements fournisseurs, sans remplacer une plateforme réglementaire d’appel d’offres ;
- salaires, pensions et indemnités comme orchestration de paiement, sans devenir logiciel de paie ;
- services municipaux et collectivités ;
- transport et mobilité publique ;
- santé publique pour paiements et droits, sans dossier médical complet ;
- agriculture et énergie publiques ;
- douane et commerce extérieur comme couche d’orchestration ;
- gestion de recettes multi-organismes ;
- affectation budgétaire logique ;
- contrôles anti-corruption et anti-collusion ;
- administration centrale multi-ministères ;
- reporting consolidé ;
- intégration aux registres publics ;
- gouvernance, publication, versionnement et audit des politiques.

---

## 3. Principes non négociables

1. **Aucun agent public ne peut recevoir de fonds publics sur un compte ou wallet personnel.**
2. **Aucun barème réglementaire, droit, allocation, bénéficiaire ou compte de règlement ne peut être modifié silencieusement.**
3. Toute décision financière sensible doit être traçable jusqu’à l’acteur, la règle, la version, l’heure, l’appareil et le contexte.
4. Les rôles de création, approbation, exécution, remboursement, administration et audit doivent pouvoir être séparés.
5. Les transactions sont idempotentes et réconciliables.
6. Les données historiques conservent les règles, frais, commissions, taxes, taux, barèmes et versions réellement appliqués.
7. Les données personnelles et administratives sont minimisées selon le service rendu.
8. Une administration ne voit pas les données d’une autre sauf base légale et politique explicite.
9. Les décisions automatisées à impact significatif doivent être explicables, contestables et réversibles selon les règles applicables.
10. Les systèmes externes sont intégrés via adaptateurs abstraits ; aucune dépendance institutionnelle n’est codée en dur.
11. Le mode réseau faible ne doit jamais autoriser la création locale définitive d’un paiement non confirmé.
12. Toute opération sensible hors ligne utilise des droits pré-autorisés, plafonds, nonce, durée d’expiration et synchronisation obligatoire.
13. Toute action d’un super administrateur doit être auditée au même niveau que celle d’un agent métier.
14. Les environnements Démo, Recette et Production sont strictement isolés.
15. Aucun secret, jeton réel ou identifiant partenaire réel ne doit être commité dans le code.

---

## 4. Périmètre fonctionnel détaillé

Le module couvre les familles suivantes :

### 4.1 Portail citoyen

- vue consolidée des obligations et paiements publics ;
- reçus vérifiables ;
- aides et droits actifs ;
- demandes administratives supportées ;
- documents et justificatifs minimisés ;
- notifications ;
- échéances ;
- contestations ;
- statut des demandes ;
- historique des consentements ;
- délégation familiale ou représentant légal si autorisée.

### 4.2 Licences, permis et autorisations

- permis commerciaux ;
- licences professionnelles ;
- autorisations municipales ;
- droits d’occupation ;
- permis événementiels ;
- cartes ou titres administratifs ;
- renouvellements ;
- suspension ;
- expiration ;
- révocation ;
- paiement des frais liés.

MANSA ne décide pas de l’éligibilité légale : il orchestre les étapes, preuves, statuts et paiements selon les règles du système public responsable.

### 4.3 Programmes sociaux

- allocations ;
- transferts ciblés ;
- aides d’urgence ;
- subventions individuelles ;
- aides scolaires ;
- aides énergie ;
- aides alimentaires ;
- appui logement ;
- programmes temporaires ;
- paiements conditionnels ou non conditionnels.

### 4.4 Subventions publiques

- subventions entreprises ;
- subventions associations ;
- agriculture ;
- énergie ;
- innovation ;
- emploi ;
- formation ;
- projets locaux ;
- décaissements par tranche ;
- contrôle de jalons ;
- justificatifs ;
- suspension ou récupération contrôlée.

### 4.5 Paiements fournisseurs et marchés publics

MANSA peut :

- recevoir une référence de marché ou contrat ;
- enregistrer fournisseurs approuvés ;
- recevoir factures et ordres de paiement ;
- appliquer workflows d’approbation ;
- bloquer paiements en cas d’anomalie ;
- payer par lot ;
- rapprocher les paiements ;
- produire des journaux d’audit.

MANSA ne remplace pas un système réglementaire de passation des marchés ni la procédure d’attribution.

### 4.6 Salaires, pensions et indemnités

Le module peut orchestrer le paiement de fichiers approuvés provenant d’un système externe :

- salaires ;
- pensions ;
- indemnités ;
- remboursements ;
- vacations ;
- aides spécifiques.

MANSA ne calcule pas automatiquement la paie légale sauf moteur explicitement contractualisé et conforme ; par défaut il reçoit des ordres signés et les exécute après contrôles.

### 4.7 Collectivités locales

- recettes municipales ;
- taxes locales ;
- marchés et emplacements ;
- stationnement ;
- voirie ;
- services de proximité ;
- licences locales ;
- collecte de redevances ;
- aides locales ;
- budgets et reporting logique ;
- rapprochement par mairie, service, quartier ou zone.

### 4.8 Mobilité publique

- titres de transport ;
- abonnements ;
- cartes usager ;
- paiement de services publics de mobilité ;
- droits spécifiques ;
- subventions transport ;
- recharges ;
- validation de titre si un opérateur partenaire fournit l’infrastructure.

### 4.9 Santé publique

- paiements de services ;
- exonérations ;
- droits et prises en charge ;
- programmes d’aide ;
- remboursements ;
- facturation établissement-patient-payer ;
- rapprochement.

Le module ne devient pas dossier médical complet. Les données de santé sont exclues sauf strict minimum nécessaire et architecture dédiée conforme.

### 4.10 Agriculture, énergie et infrastructures

- subventions intrants ;
- bons numériques ;
- aides semences ;
- équipements ;
- irrigation ;
- énergie ;
- raccordement ;
- compensation ;
- programmes de soutien ;
- paiements projet ;
- décaissements jalonnés.

### 4.11 Douane et commerce extérieur

- réception de références ;
- droits et taxes ;
- paiement ;
- garanties ou dépôts si juridiquement permis ;
- reçus ;
- statut de règlement ;
- webhooks vers le système douanier.

MANSA ne calcule pas seul la valeur douanière ni la classification légale, sauf moteur public officiellement intégré.

---

## 5. Architecture métier

### 5.1 PublicTenant

Représente un périmètre administratif isolé.

Champs recommandés :

- `id` ;
- `organizationId` ;
- `tenantType` ;
- `countryCode` ;
- `jurisdictionCode` ;
- `defaultCurrency` ;
- `dataResidencyPolicyId` ;
- `status` ;
- `environment` ;
- `createdAt` ;
- `updatedAt`.

### 5.2 PublicProgram

- `id` ;
- `tenantId` ;
- `code` ;
- `name` ;
- `programType` ;
- `countryCode` ;
- `jurisdictionCode` ;
- `startAt` ;
- `endAt` ;
- `budgetReference` optionnelle ;
- `fundingSourceReference` optionnelle ;
- `eligibilityProviderId` optionnel ;
- `paymentPolicyId` ;
- `pricingPolicyId` ;
- `status`.

États : `DRAFT`, `REVIEW`, `APPROVED`, `SCHEDULED`, `ACTIVE`, `PAUSED`, `CLOSED`, `ARCHIVED`, `CANCELLED`.

### 5.3 PublicEntitlement

Un droit attribué à une personne ou organisation.

- `id` ;
- `programId` ;
- `subjectType` ;
- `subjectId` ;
- `externalSubjectReferenceHash` ;
- `entitlementType` ;
- `amountMinor` éventuel ;
- `currencyCode` ;
- `quantity` éventuelle ;
- `validFrom` ;
- `validUntil` ;
- `rulesetVersionId` ;
- `status` ;
- `createdBy` ;
- `approvedBy`.

États : `PROPOSED`, `PENDING_REVIEW`, `ELIGIBLE`, `ACTIVE`, `PARTIALLY_USED`, `USED`, `SUSPENDED`, `REVOKED`, `EXPIRED`, `REJECTED`.

### 5.4 PublicApplication

Pour une demande citoyenne ou entreprise :

- `id` ;
- `serviceId` ;
- `applicantType` ;
- `applicantId` ;
- `submittedAt` ;
- `formSchemaVersion` ;
- `documentRefs[]` ;
- `workflowId` ;
- `status` ;
- `decisionCode` ;
- `decisionReasonCode` ;
- `decidedBy` ;
- `decidedAt`.

États : `DRAFT`, `SUBMITTED`, `IN_REVIEW`, `NEEDS_INFORMATION`, `APPROVED`, `REJECTED`, `WITHDRAWN`, `EXPIRED`, `COMPLETED`.

### 5.5 PublicLicense

- `id` ;
- `serviceId` ;
- `holderType` ;
- `holderId` ;
- `licenseType` ;
- `reference` ;
- `issuedAt` ;
- `validFrom` ;
- `validUntil` ;
- `issuingAuthorityId` ;
- `status` ;
- `verificationTokenHash` ;
- `renewalPolicyId`.

États : `PENDING`, `ACTIVE`, `SUSPENDED`, `EXPIRED`, `REVOKED`, `CANCELLED`.

### 5.6 PublicDisbursementBatch

- `id` ;
- `programId` ;
- `batchReference` ;
- `currencyCode` ;
- `expectedCount` ;
- `expectedAmountMinor` ;
- `sourceFileHash` ;
- `approvalWorkflowId` ;
- `status` ;
- `createdAt` ;
- `approvedAt` ;
- `executedAt`.

États : `UPLOADED`, `VALIDATING`, `INVALID`, `READY_FOR_APPROVAL`, `APPROVED`, `EXECUTING`, `PARTIALLY_EXECUTED`, `COMPLETED`, `FAILED`, `CANCELLED`.

---

## 6. Dossier citoyen transversal

Le dossier citoyen MANSA ne doit pas devenir une base nationale d’identité parallèle.

Il référence uniquement les informations nécessaires pour les services utilisés :

- identifiant MANSA ;
- références administratives pseudonymisées ou chiffrées ;
- consentements ;
- programmes actifs ;
- obligations ;
- paiements ;
- reçus ;
- droits ;
- demandes ;
- licences ;
- notifications ;
- contestations.

Les données sources restent chez les autorités ou partenaires lorsque cela est possible. Les références externes sensibles sont chiffrées ou hachées selon le besoin d’usage.

---

## 7. Identité, authentification et délégation

### 7.1 Citoyen

Méthodes possibles selon pays et disponibilité :

- compte MANSA vérifié ;
- identifiant administratif ;
- vérification via fournisseur d’identité externe ;
- QR sécurisé ;
- OTP ;
- passkey ;
- biométrie locale côté appareil ;
- agent assisté.

Aucune méthode nationale précise n’est imposée dans le code.

### 7.2 Agents

Exigences :

- identité nominative ;
- affectation ;
- rôle ;
- unité ;
- terminal ;
- durée de validité ;
- MFA ou step-up pour actions sensibles ;
- révocation immédiate ;
- journal de session ;
- interdiction de comptes génériques partagés.

### 7.3 Délégation

Cas possibles :

- parent/tuteur ;
- représentant d’entreprise ;
- mandataire ;
- proche aidant ;
- représentant légal.

Toute délégation doit préciser : portée, service, date de début, date de fin, preuve, révocabilité et permissions exactes.

---

## 8. RBAC et ABAC

### 8.1 Rôles standards

- `PUBLIC_SUPER_ADMIN` ;
- `MINISTRY_ADMIN` ;
- `AGENCY_ADMIN` ;
- `PROGRAM_OWNER` ;
- `PROGRAM_OPERATOR` ;
- `AGENT_FIELD` ;
- `AGENT_DESK` ;
- `FINANCE_INITIATOR` ;
- `FINANCE_APPROVER` ;
- `REFUND_APPROVER` ;
- `POLICY_ADMIN` ;
- `AUDITOR` ;
- `DATA_PROTECTION_OFFICER` ;
- `SUPPORT_READ_ONLY` ;
- `INTEGRATION_ADMIN`.

### 8.2 Permissions atomiques

Exemples :

- `public.program.create` ;
- `public.program.publish` ;
- `public.entitlement.create` ;
- `public.entitlement.approve` ;
- `public.application.review` ;
- `public.license.issue` ;
- `public.disbursement.create` ;
- `public.disbursement.approve` ;
- `public.refund.request` ;
- `public.refund.approve` ;
- `public.pricing.simulate` ;
- `public.pricing.publish` ;
- `public.partner.configure` ;
- `public.audit.read` ;
- `public.report.export`.

### 8.3 ABAC

Contexte possible :

- pays ;
- juridiction ;
- ministère ;
- organisme ;
- programme ;
- service ;
- zone ;
- montant ;
- devise ;
- canal ;
- type de bénéficiaire ;
- risque ;
- terminal ;
- heure ;
- réseau ;
- type de transaction ;
- source de fonds ;
- catégorie budgétaire.

---

## 9. Workflows et principe des quatre yeux

Toute opération sensible doit pouvoir utiliser un workflow configurable :

- création ;
- validation ;
- approbation ;
- exécution ;
- contrôle post-opération.

Exemples nécessitant double contrôle selon politique :

- changement de compte de règlement ;
- changement de tarif ;
- changement de bénéficiaire en masse ;
- décaissement important ;
- remboursement élevé ;
- suspension d’un programme ;
- import de fichier de paie/pension ;
- changement de droits administrateur ;
- modification d’intégration partenaire.

Les workflows peuvent être séquentiels, parallèles ou conditionnels.

---

## 10. Programmes sociaux et moteur d’éligibilité

MANSA doit distinguer :

1. **Source d’éligibilité externe** : un organisme fournit une liste de bénéficiaires.
2. **Moteur de règles configuré** : MANSA exécute un ruleset approuvé.
3. **Décision manuelle encadrée** : un agent propose et un autre valide.

Aucune règle d’éligibilité sensible ne doit être changée sans versionnement.

`EligibilityRuleSet` :

- `id` ;
- `programId` ;
- `version` ;
- `effectiveFrom` ;
- `effectiveUntil` ;
- `rulesJson` ;
- `authorId` ;
- `approverId` ;
- `status` ;
- `changeReason`.

Toute attribution garde le `rulesetVersionId` effectivement utilisé.

---

## 11. Décaissements de masse

Exigences :

- validation du format ;
- détection des doublons ;
- contrôle des bénéficiaires ;
- contrôle des montants ;
- contrôle de devise ;
- contrôle de source de fonds ;
- simulation ;
- approbation ;
- exécution idempotente ;
- reprise sur erreur ;
- statut par ligne ;
- rapprochement ;
- export d’erreurs ;
- audit du fichier source via hash ;
- interdiction de modifier silencieusement un fichier déjà approuvé.

Chaque ligne possède un `idempotencyKey` indépendant.

---

## 12. Subventions et décaissements par jalons

`Grant` :

- bénéficiaire ;
- programme ;
- montant accordé ;
- devise ;
- dates ;
- jalons ;
- conditions ;
- justificatifs ;
- statut ;
- contrôles ;
- historique de décaissement.

États : `DRAFT`, `UNDER_REVIEW`, `APPROVED`, `ACTIVE`, `SUSPENDED`, `COMPLETED`, `CANCELLED`, `RECOVERY_PENDING`, `CLOSED`.

Chaque tranche peut exiger :

- preuve documentaire ;
- validation terrain ;
- validation financière ;
- contrôle antifraude ;
- confirmation d’un système externe.

---

## 13. Marchés publics et fournisseurs

`PublicSupplier` :

- organisation fournisseur ;
- identifiants externes minimisés ;
- pays ;
- statut KYB ;
- statut d’habilitation ;
- comptes de règlement validés ;
- risques ;
- contrats/références ;
- dates d’effet.

Contrôles :

- nouveau compte bancaire soumis à step-up et double validation ;
- détection de compte partagé entre fournisseurs non liés ;
- détection de paiement fractionné ;
- détection de factures en double ;
- détection de modification juste avant paiement ;
- blocage selon sanctions/risk provider si applicable ;
- journaux immuables.

---

## 14. Anti-corruption et anti-collusion

Le moteur de risque public doit pouvoir produire des alertes sur :

- agent créant et approuvant la même opération ;
- agent et bénéficiaire partageant des attributs suspects selon politique ;
- répétition de remboursements ;
- annulations anormales ;
- montants juste sous seuil d’approbation ;
- paiements fractionnés ;
- concentration excessive sur un fournisseur ;
- changement fréquent de compte de règlement ;
- utilisation de plusieurs terminaux ;
- volume anormal hors horaires ;
- paiements répétés vers un même compte ;
- bénéficiaires en doublon ;
- fichiers importés modifiés après validation ;
- interventions administrateur inhabituelles.

Ces signaux ne constituent pas une preuve automatique de corruption. Ils ouvrent un workflow de revue avec droits restreints et conservation des preuves.

---

## 15. Moteur de frais, commissions et taxes

Tous les services publics utilisant MANSA doivent consommer le moteur de tarification configurable transversal.

Le module doit permettre, lorsque pertinent :

- frais fixes ;
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
- organisme ;
- programme ;
- partenaire ;
- volume ;
- commission Mansa ;
- commission agent autorisée ;
- commission commerçant ou collecteur autorisé ;
- commission partenaire ;
- commission apporteur ;
- taxes séparées ;
- date d’effet ;
- date de fin ;
- simulation avant publication ;
- approbation des changements sensibles ;
- versioning tarifaire ;
- audit immuable.

### 15.1 Séparation obligatoire des montants

Une transaction doit distinguer au minimum :

- `principalAmountMinor` ;
- `publicTaxAmountMinor` ;
- `publicDutyAmountMinor` ;
- `mansaFeeAmountMinor` ;
- `partnerFeeAmountMinor` ;
- `agentCommissionAmountMinor` ;
- `merchantCommissionAmountMinor` ;
- `otherCommissionAmountMinor` ;
- `totalDebitedMinor` ;
- `netSettlementMinor`.

Aucune interface ne doit présenter des frais Mansa comme une taxe publique.

### 15.2 Snapshot tarifaire

Chaque transaction conserve :

- `pricingPolicyId` ;
- `pricingPolicyVersion` ;
- `ruleIds[]` ;
- détail des frais ;
- détail des commissions ;
- taxes ;
- remise ;
- pays ;
- devise ;
- canal ;
- acteur ;
- partenaire ;
- horodatage.

Une modification tarifaire ultérieure ne modifie jamais une transaction historique.

---

## 16. Paiement et settlement

Le moteur public doit router les paiements vers des connecteurs abstraits :

```text
PublicPaymentProvider
BankPaymentProvider
MobileMoneyProvider
CardPaymentProvider
CashDeskProvider
TreasurySettlementProvider
GovernmentLedgerProvider
```

Capacités communes :

- `quote()` ;
- `validate()` ;
- `initiate()` ;
- `getStatus()` ;
- `cancel()` lorsque permis ;
- `refund()` lorsque permis ;
- `reconcile()` ;
- `healthCheck()`.

Un fournisseur externe n’est jamais considéré comme disponible sur la seule base de l’existence de son adaptateur logiciel.

---

## 17. API

Préfixe recommandé : `/v1/public`.

### Programmes

- `POST /programs`
- `GET /programs/{id}`
- `PATCH /programs/{id}`
- `POST /programs/{id}/submit`
- `POST /programs/{id}/approve`
- `POST /programs/{id}/activate`
- `POST /programs/{id}/pause`

### Droits

- `POST /entitlements`
- `POST /entitlements/import`
- `GET /entitlements/{id}`
- `POST /entitlements/{id}/approve`
- `POST /entitlements/{id}/suspend`
- `POST /entitlements/{id}/revoke`

### Demandes

- `POST /applications`
- `POST /applications/{id}/submit`
- `POST /applications/{id}/review`
- `POST /applications/{id}/request-information`
- `POST /applications/{id}/approve`
- `POST /applications/{id}/reject`

### Licences

- `POST /licenses`
- `GET /licenses/{id}`
- `POST /licenses/{id}/issue`
- `POST /licenses/{id}/renew`
- `POST /licenses/{id}/suspend`
- `POST /licenses/{id}/revoke`
- `GET /licenses/{id}/verify`

### Décaissements

- `POST /disbursement-batches`
- `POST /disbursement-batches/{id}/validate`
- `POST /disbursement-batches/{id}/simulate`
- `POST /disbursement-batches/{id}/approve`
- `POST /disbursement-batches/{id}/execute`
- `GET /disbursement-batches/{id}/lines`
- `GET /disbursement-batches/{id}/reconciliation`

Toutes les mutations financières exigent `Idempotency-Key`.

---

## 18. Webhooks

Événements :

- `public.program.activated` ;
- `public.program.paused` ;
- `public.entitlement.approved` ;
- `public.entitlement.revoked` ;
- `public.application.submitted` ;
- `public.application.approved` ;
- `public.application.rejected` ;
- `public.license.issued` ;
- `public.license.suspended` ;
- `public.disbursement.started` ;
- `public.disbursement.completed` ;
- `public.disbursement.partially_completed` ;
- `public.payment.completed` ;
- `public.payment.refunded` ;
- `public.risk.alert.created` ;
- `public.reconciliation.mismatch_detected`.

Exigences : signature, timestamp, anti-rejeu, identifiant unique, retry exponentiel, dead-letter queue, journal de livraison et relecture autorisée.

---

## 19. Feature flags

Exemples :

- `PUBLIC_PORTAL_ENABLED` ;
- `PUBLIC_PROGRAMS_ENABLED` ;
- `PUBLIC_LICENSES_ENABLED` ;
- `PUBLIC_SOCIAL_TRANSFERS_ENABLED` ;
- `PUBLIC_GRANTS_ENABLED` ;
- `PUBLIC_SUPPLIER_PAYMENTS_ENABLED` ;
- `PUBLIC_PAYROLL_ORCHESTRATION_ENABLED` ;
- `PUBLIC_MUNICIPAL_ENABLED` ;
- `PUBLIC_TRANSPORT_ENABLED` ;
- `PUBLIC_HEALTH_PAYMENTS_ENABLED` ;
- `PUBLIC_CUSTOMS_ENABLED` ;
- `PUBLIC_OFFLINE_AGENT_MODE_ENABLED`.

Les flags peuvent être limités par pays, tenant, organisme, environnement, rôle et version d’application.

---

## 20. Administration

La console doit permettre :

- gestion des tenants publics ;
- organisations ;
- services ;
- programmes ;
- agents ;
- rôles ;
- politiques ;
- workflows ;
- droits ;
- lots ;
- licences ;
- intégrations ;
- comptes de règlement ;
- pricing ;
- feature flags ;
- limites ;
- alertes ;
- rapprochements ;
- audit ;
- export contrôlé.

Les changements sensibles passent par une file d’approbation et peuvent être planifiés pour une date d’effet future.

---

## 21. Données, minimisation et confidentialité

Règles :

- collecter uniquement les champs nécessaires ;
- définir une finalité par champ ;
- conserver la provenance ;
- chiffrer les identifiants sensibles ;
- masquer les données selon rôle ;
- journaliser les consultations sensibles ;
- appliquer rétention par catégorie ;
- permettre anonymisation ou suppression lorsque légalement possible ;
- conserver les écritures financières selon les obligations applicables ;
- ne jamais utiliser une donnée administrative pour une autre finalité sans base appropriée.

---

## 22. Réseau faible et hors ligne

Le mode dégradé doit privilégier la consultation de données cacheables et la capture d’intentions, pas la création irréversible de monnaie ou de paiement.

### Autorisé potentiellement

- consultation d’un catalogue signé ;
- consultation de barèmes signés ;
- scan d’un QR ;
- création locale d’un brouillon ;
- capture d’un formulaire ;
- capture d’une preuve ;
- émission d’un reçu provisoire explicitement marqué non payé ;
- file locale chiffrée de synchronisation.

### Interdit sans pré-autorisation

- confirmer un paiement ;
- créer un bénéficiaire définitif ;
- modifier un tarif ;
- accorder une subvention ;
- valider un remboursement ;
- déclarer un titre valide ;
- modifier un compte de règlement.

Pour les cas terrain nécessitant une capacité offline réelle, utiliser des jetons pré-autorisés à usage limité : plafond, nombre d’opérations, zone, durée, terminal, agent et nonce.

---

## 23. Sécurité

Exigences :

- MFA pour agents sensibles ;
- passkeys lorsque supportées ;
- chiffrement en transit et au repos ;
- rotation des secrets ;
- KMS/HSM si disponible pour clés critiques ;
- tokens courts ;
- détection de session anormale ;
- device binding pour terminaux terrain ;
- rate limiting ;
- WAF/API gateway ;
- protection CSRF/XSS/SSRF/injection ;
- contrôle strict des exports ;
- malware scanning des pièces jointes ;
- signed URLs à durée limitée ;
- aucun secret dans logs ;
- redaction automatique des PII ;
- séparation des environnements.

---

## 24. Audit immuable

Chaque événement sensible doit enregistrer :

- `eventId` ;
- acteur ;
- rôle ;
- tenant ;
- organisme ;
- action ;
- ressource ;
- anciennes valeurs sensibles hachées ou diff minimisé ;
- nouvelles valeurs ;
- justification ;
- IP ;
- appareil ;
- session ;
- horodatage serveur ;
- request ID ;
- correlation ID ;
- workflow/approbation ;
- règle appliquée.

Les journaux d’audit ne doivent pas être modifiables par les administrateurs métier.

---

## 25. Rapprochement

Chaque flux doit permettre rapprochement entre :

1. ordre public ;
2. transaction MANSA ;
3. provider externe ;
4. compte de règlement ;
5. système financier public externe.

Statuts : `UNMATCHED`, `MATCHED`, `PARTIAL`, `MISMATCH`, `UNDER_REVIEW`, `RESOLVED`, `WRITTEN_OFF` si politique l’autorise.

Aucun écart ne doit disparaître par modification manuelle silencieuse.

---

## 26. Reporting et BI

Dimensions :

- organisme ;
- programme ;
- service ;
- région ;
- zone ;
- agent ;
- canal ;
- devise ;
- moyen de paiement ;
- période ;
- statut ;
- partenaire ;
- catégorie de bénéficiaire.

Indicateurs :

- montant collecté ;
- montant décaissé ;
- frais ;
- commissions ;
- taxes ;
- taux de réussite ;
- erreurs ;
- remboursements ;
- contestations ;
- délais de traitement ;
- écarts de rapprochement ;
- alertes fraude ;
- bénéficiaires servis ;
- programmes actifs.

Les rapports détaillés contenant des données personnelles nécessitent une permission spécifique.

---

## 27. Multi-pays et multi-devises

Chaque objet métier sensible possède explicitement :

- `countryCode` ;
- `jurisdictionCode` si pertinent ;
- `currencyCode` ;
- `timezone` ;
- `locale`.

Les règles de disponibilité, limites, documents, partenaires, taxes, frais et workflows sont configurées par pays/juridiction.

Les conversions FX utilisent exclusivement le module 13 et conservent le taux appliqué, la source, le spread et le snapshot de pricing.

---

## 28. Intégrations partenaires abstraites

Interfaces possibles :

```text
GovernmentIdentityProvider
CivilRegistryProvider
TaxAuthorityProvider
CustomsProvider
EducationProvider
HealthPaymentProvider
TransportProvider
SocialRegistryProvider
PayrollProvider
PensionProvider
TreasuryProvider
GovernmentLedgerProvider
BankProvider
MobileMoneyProvider
CardProvider
NotificationProvider
DocumentVerificationProvider
FraudScreeningProvider
```

Chaque connecteur expose :

- capacités ;
- pays ;
- environnement ;
- santé ;
- timeouts ;
- limites ;
- erreurs normalisées ;
- idempotence ;
- retry ;
- circuit breaker ;
- configuration chiffrée.

---

## 29. Gestion des erreurs et résilience

Principes :

- timeout explicite ;
- retry uniquement sur erreurs sûres ;
- backoff exponentiel ;
- circuit breaker ;
- DLQ ;
- idempotence ;
- saga pour workflows distribués ;
- compensation contrôlée ;
- statut `UNKNOWN` plutôt qu’une fausse réussite ;
- resynchronisation périodique ;
- métriques de santé par connecteur.

---

## 30. Tests fonctionnels

Couvrir au minimum :

- création programme ;
- publication avec approbation ;
- attribution droit ;
- révocation ;
- demande citoyenne ;
- licence ;
- renouvellement ;
- lot de décaissement ;
- doublon dans lot ;
- bénéficiaire invalide ;
- paiement partiel ;
- échec partenaire ;
- reprise ;
- remboursement ;
- changement de tarif ;
- snapshot historique ;
- contrôle SoD ;
- changement de compte de règlement ;
- alerte antifraude ;
- réseau faible ;
- conflit de version ;
- multi-devise ;
- fermeture programme.

---

## 31. Tests sécurité

- élévation de privilèges ;
- IDOR ;
- isolation tenant ;
- contournement ABAC ;
- replay webhook ;
- injection ;
- upload malveillant ;
- accès à un export sans permission ;
- modification de payload signé ;
- bypass workflow ;
- double exécution d’un lot ;
- falsification de reçu ;
- rotation de secrets ;
- session révoquée ;
- terminal compromis ;
- corruption de file offline.

---

## 32. Tests performance

Objectifs à définir par environnement, avec au minimum :

- campagnes de décaissement massif ;
- pics de paiement le jour d’échéance ;
- lecture de catalogue ;
- génération de reçus ;
- ingestion de webhooks ;
- rapprochement nocturne ;
- exports volumineux ;
- dashboard consolidé.

Les opérations lourdes doivent être asynchrones et suivies par job.

---

## 33. Observabilité

Métriques :

- latence API ;
- taux d’erreur ;
- taux d’échec provider ;
- file d’attente ;
- DLQ ;
- lots en attente ;
- paiements inconnus ;
- rapprochements non résolus ;
- alertes fraude ;
- taux de retry ;
- circuit breakers ouverts ;
- temps moyen d’approbation ;
- disponibilité par tenant.

Logs structurés avec `requestId`, `correlationId`, `tenantId`, `organizationId`, `programId` et redaction PII.

---

## 34. Ordre de développement recommandé

### Phase 1 — Fondations

- tenant public ;
- RBAC/ABAC ;
- audit ;
- workflows ;
- provider abstraction ;
- pricing hooks ;
- feature flags.

### Phase 2 — Portail et programmes

- portail citoyen ;
- programmes ;
- droits ;
- demandes ;
- notifications.

### Phase 3 — Décaissements

- lots ;
- validations ;
- approbations ;
- exécution ;
- reprise ;
- rapprochement.

### Phase 4 — Licences et autorisations

- licences ;
- renouvellements ;
- vérification ;
- suspension/révocation.

### Phase 5 — Subventions et fournisseurs

- grants ;
- jalons ;
- fournisseurs ;
- paiements ;
- antifraude avancée.

### Phase 6 — Domaines complémentaires

- collectivités ;
- transport ;
- santé paiement ;
- agriculture ;
- énergie ;
- douane.

### Phase 7 — BI et industrialisation

- reporting consolidé ;
- performance ;
- résilience ;
- reprise après incident ;
- tests charge ;
- runbooks.

---

## 35. Critères d’acceptation

Le module est acceptable lorsque :

1. un tenant public peut être créé sans fuite inter-organisme ;
2. un programme peut être configuré, approuvé, activé et clôturé ;
3. les droits sont versionnés et auditables ;
4. un lot de décaissement est validé, simulé, approuvé et exécuté de façon idempotente ;
5. une erreur fournisseur ne crée ni double paiement ni faux succès ;
6. les rôles et politiques ABAC empêchent l’auto-approbation interdite ;
7. les changements de pricing sensibles nécessitent approbation ;
8. toute transaction conserve son snapshot tarifaire ;
9. frais, commissions et taxes sont séparés ;
10. les paiements sont rapprochables avec provider et système public ;
11. les licences sont vérifiables et révocables ;
12. les données personnelles sont minimisées et masquées selon rôle ;
13. l’audit est immuable ;
14. les webhooks sont signés et anti-rejeu ;
15. le mode réseau faible ne peut pas fabriquer un paiement confirmé ;
16. toutes les dépendances externes sont abstraites ;
17. aucun partenaire n’est marqué disponible sans configuration contractuelle réelle ;
18. les tests fonctionnels, sécurité, performance et résilience passent ;
19. les deux dépôts Mansa conservent exactement le même document ;
20. le module est compatible avec le futur **Pricing & Commission Engine central** du module 20.

---

## 36. Définition de terminé

Le module est considéré terminé côté spécification lorsque :

- le périmètre est documenté ;
- les responsabilités avec le socle public existant sont claires ;
- les modèles de données sont définis ;
- les états sont définis ;
- les parcours critiques sont couverts ;
- RBAC/ABAC est défini ;
- le pricing configurable est intégré ;
- API et webhooks sont définis ;
- feature flags sont définis ;
- sécurité, audit et fraude sont couverts ;
- multi-pays et multi-devises sont couverts ;
- réseau faible/hors ligne est traité ;
- partenaires abstraits sont définis ;
- tests et critères d’acceptation sont listés ;
- l’ordre de développement est défini ;
- aucun secret ou partenaire réel non contractualisé n’est inscrit dans la spécification.
