# 14 — Mansa Entreprise / B2B avancé

## 1. Objectif

Le module **Mansa Entreprise / B2B avancé** transforme MANSA en plateforme financière, opérationnelle et administrative pour entreprises, associations, ONG, établissements, commerçants structurés, réseaux de franchises, administrations partenaires et organisations multi-entités.

Le module doit permettre à une organisation de gérer ses comptes, équipes, rôles, dépenses, cartes, paiements, encaissements, factures, abonnements, budgets, approbations, paiements fournisseurs, remboursements de frais, trésorerie, devises, rapports, API, intégrations et contrôles internes depuis une console unifiée.

Le principe directeur est : **une organisation ne doit jamais être traitée comme un simple utilisateur individuel avec davantage de boutons**. Le B2B impose des concepts spécifiques : entité légale, établissement, équipe, rôle, délégation, politique de dépense, double validation, séparation des responsabilités, procuration, limites, journal d’audit, documents, conformité KYB, bénéficiaires effectifs, signataires, contrôles antifraude, rapprochement comptable et gestion multi-pays.

Toute capacité bancaire, Mobile Money, carte, crédit, assurance, change, paie, téléphonie, bourse ou partenaire externe reste abstraite et configurable. MANSA ne doit jamais présenter une intégration comme réellement disponible sans contrat, autorisation, accès technique et validation réglementaire.

---

## 2. Principes fondamentaux

1. **Séparation stricte personne / organisation** : un utilisateur humain peut appartenir à plusieurs organisations sans fusion de données ni de droits.
2. **Multi-entités natif** : une entreprise peut contenir plusieurs entités légales, branches, agences, établissements, boutiques, filiales ou centres de coûts.
3. **RBAC + ABAC** : les permissions reposent sur des rôles mais aussi sur le contexte, les montants, pays, devises, unités, horaires, canaux et politiques.
4. **Séparation des responsabilités** : l’initiateur, l’approbateur, l’exécutant et le contrôleur peuvent être différents.
5. **Traçabilité totale** : toute action sensible est auditable avec acteur, contexte, horodatage, ancienne valeur, nouvelle valeur et justification éventuelle.
6. **Snapshots immuables** : toute transaction historique conserve les frais, commissions, taxes, taux, limites et règles effectivement appliqués au moment de l’exécution.
7. **Least privilege** : aucune permission n’est héritée implicitement au-delà de ce qui est nécessaire.
8. **Aucune dépendance partenaire codée en dur** : chaque fournisseur externe passe par une interface abstraite et un routeur configurable.
9. **Multi-pays et multi-devises dès la conception** : pays, devise, résidence fiscale, juridiction et disponibilité produit doivent être explicites.
10. **Mode dégradé sûr** : si un partenaire externe ou un réseau est indisponible, aucune opération financière ne doit être doublée ou inventée.
11. **Consentement et visibilité minimisés** : les employés ne voient que les données nécessaires à leur rôle.
12. **Configuration administrable sans redéploiement** pour politiques, limites, frais, commissions, canaux, feature flags et approbations.

---

## 3. Périmètre fonctionnel

Le module couvre notamment :

- création et onboarding d’organisation ;
- KYB et vérification documentaire ;
- entités légales et établissements ;
- équipes et membres ;
- rôles et permissions ;
- invitations ;
- procurations et délégations ;
- comptes financiers d’entreprise ;
- sous-comptes ;
- centres de coûts ;
- budgets ;
- cartes entreprise ;
- cartes virtuelles ;
- politiques de dépense ;
- dépenses collaborateurs ;
- reçus et justificatifs ;
- notes de frais ;
- avances ;
- paiements fournisseurs ;
- paiements de masse ;
- bénéficiaires ;
- encaissements ;
- liens et QR de paiement ;
- facturation B2B ;
- abonnements et dépenses récurrentes ;
- workflows d’approbation ;
- trésorerie ;
- change et devises ;
- reporting ;
- exports comptables ;
- rapprochement ;
- intégrations ERP/comptabilité ;
- API et webhooks ;
- sécurité ;
- audit ;
- antifraude ;
- feature flags ;
- administration ;
- support ;
- sandbox ;
- multi-pays ;
- moteur de frais et commissions configurable.

Hors périmètre par défaut : tenue légale de comptabilité certifiée, paie réglementée complète, émission autonome de cartes, crédit direct, assurance directe, tenue de compte bancaire sans partenaire, acquisition carte sans acquéreur, trading financier propre et services réglementés non couverts par licence ou contrat.

---

## 4. Architecture métier multi-organisation

### 4.1 Organization

Modèle recommandé `Organization` :

- `id` ;
- `legalName` ;
- `tradeName` ;
- `organizationType` ;
- `registrationCountry` ;
- `operatingCountries[]` ;
- `registrationNumber` ;
- `taxIdentifier` éventuel ;
- `sectorCode` ;
- `sizeSegment` : `MICRO`, `SME`, `MID_MARKET`, `ENTERPRISE`, `NGO`, `ASSOCIATION`, `PUBLIC_BODY`, `OTHER` ;
- `kybStatus` ;
- `riskLevel` ;
- `defaultCurrency` ;
- `status` ;
- `pricingPlanId` ;
- `parentOrganizationId` éventuel ;
- `createdAt` ;
- `updatedAt`.

États : `DRAFT`, `PENDING_KYB`, `UNDER_REVIEW`, `ACTIVE`, `RESTRICTED`, `SUSPENDED`, `CLOSING`, `CLOSED`, `REJECTED`.

### 4.2 LegalEntity

Une organisation peut contenir plusieurs entités légales.

Champs :

- `id` ;
- `organizationId` ;
- `name` ;
- `country` ;
- `legalForm` ;
- `registrationNumber` ;
- `taxId` ;
- `registeredAddressId` ;
- `operatingAddressIds[]` ;
- `status` ;
- `kybStatus` ;
- `settlementProfileId` ;
- `accountingProfileId`.

### 4.3 BusinessUnit

Permet de représenter agence, boutique, succursale, département, projet ou centre de profit.

- `id` ;
- `organizationId` ;
- `legalEntityId` ;
- `name` ;
- `code` ;
- `type` ;
- `parentUnitId` ;
- `country` ;
- `currency` ;
- `costCenterId` ;
- `managerMemberId` ;
- `status`.

La hiérarchie doit être exploitable par ABAC afin de limiter l’accès d’un manager à son périmètre.

---

## 5. Membres, identités et invitations

### 5.1 OrganizationMember

Un même compte utilisateur MANSA peut être membre de plusieurs organisations.

Champs :

- `id` ;
- `organizationId` ;
- `userId` ;
- `memberType` : `OWNER`, `DIRECTOR`, `EMPLOYEE`, `CONTRACTOR`, `ACCOUNTANT`, `AUDITOR`, `EXTERNAL_ADMIN`, `OTHER` ;
- `status` ;
- `businessUnitIds[]` ;
- `roleAssignmentIds[]` ;
- `employmentReference` optionnelle ;
- `joinedAt` ;
- `endedAt`.

États : `INVITED`, `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`, `OFFBOARDED`, `REVOKED`.

### 5.2 Invitation

Une invitation doit contenir :

- email ou téléphone masqué dans les vues non autorisées ;
- rôle proposé ;
- unité cible ;
- date d’expiration ;
- initiateur ;
- méthodes de vérification ;
- statut ;
- token à usage unique stocké de façon sûre.

États : `CREATED`, `SENT`, `VIEWED`, `ACCEPTED`, `EXPIRED`, `REVOKED`.

Aucune invitation ne doit permettre d’obtenir des privilèges supérieurs à ceux que l’initiateur est autorisé à déléguer.

---

## 6. RBAC, ABAC et séparation des responsabilités

### 6.1 Rôles standards

Rôles préconfigurés possibles :

- `ORG_OWNER` ;
- `ORG_SUPER_ADMIN` ;
- `FINANCE_ADMIN` ;
- `TREASURY_MANAGER` ;
- `ACCOUNTANT` ;
- `AP_MANAGER` ;
- `AR_MANAGER` ;
- `EXPENSE_MANAGER` ;
- `CARD_ADMIN` ;
- `TEAM_MANAGER` ;
- `PAYMENT_INITIATOR` ;
- `PAYMENT_APPROVER` ;
- `AUDITOR_READ_ONLY` ;
- `DEVELOPER_ADMIN` ;
- `SUPPORT_LIAISON` ;
- `EMPLOYEE`.

Les rôles sont configurables mais certaines permissions critiques peuvent être protégées par politique centrale.

### 6.2 Permissions atomiques

Exemples :

- `org.read` ;
- `org.settings.write` ;
- `member.invite` ;
- `member.role.assign` ;
- `wallet.read` ;
- `wallet.transfer.initiate` ;
- `wallet.transfer.approve` ;
- `beneficiary.create` ;
- `beneficiary.approve` ;
- `card.issue.request` ;
- `card.policy.manage` ;
- `expense.submit` ;
- `expense.approve` ;
- `invoice.create` ;
- `invoice.approve` ;
- `report.export` ;
- `developer.credentials.manage` ;
- `audit.read` ;
- `pricing.view` ;
- `pricing.simulate`.

### 6.3 ABAC

Les règles ABAC peuvent tenir compte de :

- organisation ;
- entité légale ;
- business unit ;
- centre de coût ;
- montant ;
- devise ;
- pays ;
- bénéficiaire ;
- canal ;
- type de dépense ;
- jour/heure ;
- appareil ;
- niveau de risque ;
- type de transaction ;
- environnement ;
- segment d’utilisateur.

Exemple : un responsable d’agence peut approuver des dépenses jusqu’à 500 000 XOF pour son agence uniquement, pendant les jours ouvrés, hors bénéficiaire nouveau et hors paiement international.

### 6.4 SoD

Règles minimales recommandées :

- le créateur d’un bénéficiaire ne peut pas l’approuver si la politique l’interdit ;
- un utilisateur ne peut pas approuver sa propre dépense au-delà d’un seuil ;
- un administrateur technique ne peut pas détenir par défaut un droit financier ;
- les changements de pricing sensibles nécessitent approbation distincte ;
- les changements de compte de règlement nécessitent step-up authentication et éventuellement double approbation.

---

## 7. KYB et conformité entreprise

### 7.1 KYBProfile

Champs recommandés :

- `organizationId` ;
- `legalEntityId` ;
- `country` ;
- `registrationData` ;
- `registeredAddress` ;
- `businessActivity` ;
- `estimatedMonthlyVolume` ;
- `fundingSources[]` ;
- `expectedUseCases[]` ;
- `beneficialOwners[]` ;
- `directors[]` ;
- `authorizedSignatories[]` ;
- `documents[]` ;
- `screeningStatus` ;
- `riskScore` ;
- `reviewStatus` ;
- `reviewedAt`.

### 7.2 Documents

Types génériques :

- registre de commerce ;
- statuts ;
- justificatif d’adresse ;
- identification fiscale ;
- preuve d’activité ;
- justificatifs des dirigeants ;
- justificatifs des bénéficiaires effectifs ;
- procurations ;
- attestations réglementaires selon pays.

Les exigences doivent être configurables par juridiction. Aucun modèle documentaire malien, français ou autre ne doit être codé comme universel.

### 7.3 Re-KYB

Déclencheurs :

- expiration documentaire ;
- changement d’actionnariat ;
- changement de dirigeant ;
- variation importante de volume ;
- incident risque ;
- changement de pays ;
- obligation périodique.

---

## 8. Comptes, wallets et sous-comptes entreprise

Une organisation peut disposer de plusieurs comptes ou wallets logiques selon les capacités réellement autorisées.

### 8.1 BusinessWallet

Champs :

- `id` ;
- `organizationId` ;
- `legalEntityId` ;
- `businessUnitId` optionnel ;
- `name` ;
- `purpose` ;
- `currencyCode` ;
- `ledgerAccountId` ;
- `status` ;
- `spendPolicyId` ;
- `fundingPolicyId`.

Types possibles :

- compte principal ;
- trésorerie ;
- dépenses équipes ;
- projet ;
- taxes ;
- paie technique ;
- collecte ;
- réserve ;
- remboursement ;
- escrow uniquement si juridiquement permis.

États : `REQUESTED`, `ACTIVE`, `RESTRICTED`, `FROZEN`, `CLOSING`, `CLOSED`.

### 8.2 Soldes multi-devises

Chaque solde doit réutiliser le module 13. Aucun calcul FX B2B parallèle n’est autorisé.

---

## 9. Budgets et centres de coûts

### 9.1 CostCenter

- `id` ;
- `organizationId` ;
- `code` ;
- `name` ;
- `businessUnitId` ;
- `ownerMemberId` ;
- `status`.

### 9.2 Budget

- `id` ;
- `organizationId` ;
- `costCenterId` ;
- `periodType` ;
- `startAt` ;
- `endAt` ;
- `currency` ;
- `allocatedMinor` ;
- `committedMinor` ;
- `spentMinor` ;
- `remainingMinor` ;
- `rolloverPolicy` ;
- `status`.

Les budgets doivent pouvoir être :

- mensuels ;
- trimestriels ;
- annuels ;
- projet ;
- événement ;
- voyage ;
- équipe ;
- carte ;
- fournisseur.

Une réservation de dépense peut augmenter `committedMinor` avant exécution réelle.

---

## 10. Politiques de dépense

### 10.1 SpendPolicy

Critères :

- plafond par opération ;
- plafond journalier ;
- hebdomadaire ;
- mensuel ;
- devise ;
- catégories autorisées ;
- catégories interdites ;
- pays ;
- commerçants ;
- MCC si disponible via partenaire carte ;
- horaires ;
- jours ;
- canal ;
- paiement en ligne ;
- sans contact ;
- ATM ;
- paiement international ;
- justificatif obligatoire ;
- commentaire obligatoire ;
- approbation préalable ;
- niveau de risque.

Les politiques doivent pouvoir être attachées à :

- un membre ;
- une équipe ;
- une carte ;
- un wallet ;
- un centre de coût ;
- un projet.

Le moteur de résolution doit définir explicitement la priorité en cas de politiques multiples. Principe recommandé : la règle la plus restrictive prévaut sauf règle d’override explicitement autorisée et auditée.

---

## 11. Cartes entreprise

Les cartes restent dépendantes d’un émetteur ou programme partenaire réel.

### 11.1 BusinessCard

Champs :

- `id` ;
- `organizationId` ;
- `holderMemberId` ;
- `walletId` ;
- `cardProgramId` abstrait ;
- `cardType` : `PHYSICAL`, `VIRTUAL`, `SINGLE_USE`, `LIMITED_USE` ;
- `status` ;
- `spendPolicyId` ;
- `currency` ;
- `last4` ;
- `tokenReference` ;
- `issuedAt` ;
- `expiresAt`.

Aucune donnée PAN complète ne doit être stockée dans les systèmes généraux MANSA hors architecture PCI explicitement prévue.

### 11.2 Parcours carte

- demande ;
- vérification d’éligibilité ;
- approbation ;
- émission partenaire ;
- activation ;
- utilisation ;
- gel/dégel ;
- changement de limite ;
- remplacement ;
- résiliation.

Toute modification critique génère audit et notification.

---

## 12. Dépenses collaborateurs

### 12.1 Expense

- `id` ;
- `organizationId` ;
- `memberId` ;
- `transactionId` éventuel ;
- `amountMinor` ;
- `currency` ;
- `merchantName` ;
- `category` ;
- `costCenterId` ;
- `projectId` ;
- `receiptDocumentId` ;
- `businessPurpose` ;
- `status` ;
- `policyResult` ;
- `approvalWorkflowId` ;
- `createdAt`.

États : `DRAFT`, `PENDING_RECEIPT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `REIMBURSEMENT_PENDING`, `REIMBURSED`, `CANCELLED`.

### 12.2 Justificatifs

Fonctions :

- capture photo ;
- import PDF/image ;
- extraction structurée facultative ;
- détection de doublons ;
- hash documentaire ;
- rapprochement automatique avec transaction ;
- règles de conservation selon pays.

Toute extraction IA doit être considérée comme suggestion jusqu’à validation selon seuil de confiance.

---

## 13. Notes de frais et remboursements

Parcours :

1. l’employé soumet une dépense personnelle professionnelle ;
2. il ajoute justificatif et centre de coût ;
3. le système vérifie la politique ;
4. le manager ou finance approuve ;
5. MANSA crée une instruction de remboursement ;
6. l’instruction est exécutée via rail disponible ;
7. le remboursement est rapproché ;
8. les frais appliqués sont snapshotés.

Le bénéficiaire employé ne doit pas pouvoir modifier le montant après approbation sans réouverture formelle.

---

## 14. Bénéficiaires et fournisseurs

### 14.1 BusinessBeneficiary

- `id` ;
- `organizationId` ;
- `name` ;
- `type` : `SUPPLIER`, `EMPLOYEE`, `TAX_AUTHORITY`, `PARTNER`, `OTHER` ;
- `country` ;
- `currency` ;
- `paymentMethodType` ;
- `destinationTokenizedData` ;
- `verificationStatus` ;
- `riskScore` ;
- `status` ;
- `createdBy` ;
- `approvedBy`.

États : `DRAFT`, `PENDING_VERIFICATION`, `PENDING_APPROVAL`, `ACTIVE`, `RESTRICTED`, `BLOCKED`, `ARCHIVED`.

Les coordonnées sensibles doivent être chiffrées ou tokenisées selon leur nature.

### 14.2 Contrôles bénéficiaire

- détection de doublon ;
- changement de coordonnées ;
- période de refroidissement configurable ;
- step-up authentication ;
- double approbation au-delà d’un risque ;
- listes sanctions et règles AML selon juridiction ;
- alerte changement inhabituel.

---

## 15. Paiements fournisseurs

### 15.1 SupplierPayment

Champs :

- `id` ;
- `organizationId` ;
- `beneficiaryId` ;
- `sourceWalletId` ;
- `amountMinor` ;
- `currency` ;
- `invoiceReference` ;
- `paymentMethod` ;
- `pricingSnapshot` ;
- `taxSnapshot` ;
- `status` ;
- `approvalWorkflowInstanceId` ;
- `partnerReference` ;
- `idempotencyKey`.

États : `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `FUNDS_RESERVED`, `SUBMITTED`, `PROCESSING`, `SETTLED`, `FAILED`, `CANCELLED`, `REVERSED`, `RECONCILIATION_PENDING`.

Un timeout partenaire ne doit jamais être converti immédiatement en `FAILED` sans interrogation de statut ou rapprochement.

---

## 16. Paiements de masse

Cas d’usage :

- fournisseurs ;
- remboursements ;
- commissions ;
- allocations ;
- primes ;
- versements partenaires ;
- paiements programmés.

### 16.1 BulkPaymentBatch

- `id` ;
- `organizationId` ;
- `sourceWalletId` ;
- `currency` ;
- `itemCount` ;
- `totalAmountMinor` ;
- `totalFeeMinor` ;
- `status` ;
- `approvalWorkflowId` ;
- `createdBy` ;
- `createdAt`.

États : `UPLOADED`, `VALIDATING`, `INVALID`, `READY`, `PENDING_APPROVAL`, `APPROVED`, `PROCESSING`, `PARTIAL_SUCCESS`, `COMPLETED`, `FAILED`, `CANCELLED`.

Chaque ligne possède son propre statut et identifiant idempotent.

Un batch partiellement réussi ne doit pas être relancé en entier sans détecter les lignes déjà exécutées.

---

## 17. Encaissements B2B

Mansa Entreprise peut recevoir des paiements via les rails réellement activés :

- transfert MANSA interne ;
- QR ;
- lien de paiement ;
- Mobile Money via partenaire ;
- carte via acquéreur ;
- virement bancaire ;
- API ;
- autre rail configuré.

### 17.1 CollectionAccount

Permet d’affecter les encaissements à :

- boutique ;
- agence ;
- facture ;
- vendeur ;
- terminal ;
- événement ;
- campagne.

Les fonds ne doivent être considérés disponibles que selon la finalité réelle du rail.

---

## 18. Facturation entreprise

Le module 7 Factures avancées doit être réutilisé, avec extensions B2B :

- factures clients ;
- devis ;
- échéances ;
- paiements partiels ;
- avoirs ;
- relances ;
- références de commande ;
- centre de coût ;
- export comptable ;
- taxes paramétrables ;
- statut de règlement ;
- rapprochement automatique.

Aucun second moteur de facture ne doit être créé spécifiquement pour B2B.

---

## 19. Abonnements et dépenses récurrentes

Le module 8 doit être réutilisé pour :

- SaaS ;
- télécoms ;
- hébergement ;
- fournisseurs récurrents ;
- loyers ;
- licences ;
- contrats ;
- outils professionnels.

La console Entreprise doit permettre :

- détection ;
- catégorisation ;
- attribution centre de coût ;
- renouvellement ;
- budget récurrent ;
- alertes hausse de prix ;
- responsable métier ;
- politique d’annulation ;
- approbation d’un nouvel abonnement.

---

## 20. Workflows d’approbation

### 20.1 ApprovalPolicy

Critères :

- type d’opération ;
- montant ;
- devise ;
- pays ;
- centre de coût ;
- bénéficiaire ;
- bénéficiaire nouveau ou existant ;
- niveau de risque ;
- canal ;
- type de membre ;
- projet ;
- catégorie de dépense.

### 20.2 Étapes

Exemples :

- manager ;
- finance ;
- direction ;
- trésorerie ;
- conformité ;
- approbateur externe.

Modes :

- séquentiel ;
- parallèle ;
- quorum ;
- `N_OF_M` ;
- conditionnel ;
- escalade.

### 20.3 ApprovalInstance

Champs :

- `id` ;
- `policyVersionId` ;
- `resourceType` ;
- `resourceId` ;
- `currentStep` ;
- `status` ;
- `requestedAt` ;
- `expiresAt` ;
- `decisions[]`.

États : `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`, `CANCELLED`, `ESCALATED`.

Une modification matérielle d’une opération après approbation invalide l’approbation et redémarre le workflow selon politique.

---

## 21. Délégations et procurations

Une délégation est explicite, limitée et révocable.

`Delegation` :

- délégant ;
- délégataire ;
- organisation ;
- périmètre ;
- permissions ;
- montant max ;
- pays ;
- dates début/fin ;
- justification ;
- approbation ;
- statut.

Aucune délégation illimitée permanente ne doit être créée par défaut.

La fin d’emploi ou suspension du délégant peut révoquer les délégations selon politique.

---

## 22. Trésorerie entreprise

Fonctions :

- vue consolidée des soldes ;
- soldes par entité ;
- soldes par devise ;
- prévisions simples ;
- positions ;
- virements inter-wallets ;
- sweep configuré ;
- seuils de liquidité ;
- alertes ;
- réserves ;
- visibilité des règlements attendus ;
- exposition FX.

Tout mouvement entre entités légales distinctes doit être considéré comme une opération explicite avec motif et contraintes, pas comme simple déplacement interne arbitraire.

---

## 23. Change et multi-devises

Le module 13 est la source unique.

Mansa Entreprise peut exposer :

- soldes par devise ;
- quotes ;
- conversion ;
- paiements cross-currency ;
- taux négociés si contrat réel ;
- spreads spécifiques entreprise ;
- limites ;
- règles par entité.

Les taux et spreads historiques sont immuables dans les transactions.

---

## 24. Export comptable et intégrations ERP

### 24.1 AccountingExportProfile

- `organizationId` ;
- `format` ;
- `chartOfAccountsMapping` ;
- `taxMapping` ;
- `costCenterMapping` ;
- `currencyPolicy` ;
- `dateFormat` ;
- `timezone` ;
- `status`.

Formats possibles :

- CSV ;
- XLSX via export ;
- JSON ;
- formats partenaires spécifiques via adaptateurs ;
- API.

### 24.2 AccountingConnector

Interface abstraite :

- `pushTransactions()` ;
- `pushExpenses()` ;
- `pushInvoices()` ;
- `pushAttachments()` ;
- `pullAccounts()` ;
- `pullCostCenters()` ;
- `health()`.

Aucun ERP n’est supposé connecté en production par défaut.

---

## 25. Réconciliation

### 25.1 ReconciliationCase

- `id` ;
- `organizationId` ;
- `rail` ;
- `internalReference` ;
- `externalReference` ;
- `expectedAmountMinor` ;
- `observedAmountMinor` ;
- `currency` ;
- `status` ;
- `differenceReason` ;
- `assignedTo` ;
- `createdAt`.

États : `MATCHED`, `MISSING_EXTERNAL`, `MISSING_INTERNAL`, `AMOUNT_MISMATCH`, `DUPLICATE`, `PENDING_REVIEW`, `RESOLVED`.

Les écarts ne doivent jamais être corrigés en modifiant l’historique financier. Toute correction passe par une écriture compensatrice auditable.

---

## 26. Moteur de frais et commissions obligatoire

Le module B2B doit consommer le futur **Pricing & Commission Engine central**. En attendant sa formalisation finale au module 20, les contrats d’interface doivent déjà être définis de façon compatible.

### 26.1 Types de tarification

Le moteur doit supporter :

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
- segment entreprise ;
- partenaire ;
- volume ;
- plan commercial ;
- produit ;
- rail ;
- type de transaction ;
- période.

### 26.2 Répartition de commission

Le moteur peut répartir séparément :

- commission MANSA ;
- commission agent ;
- commission commerçant ;
- commission partenaire ;
- commission apporteur ;
- autre bénéficiaire contractuel autorisé ;
- taxes séparées.

Chaque composante doit être identifiable dans le ledger et dans le snapshot tarifaire.

### 26.3 PricingRule

Champs recommandés :

- `id` ;
- `scopeType` ;
- `scopeId` ;
- `operationType` ;
- `country` ;
- `currency` ;
- `channel` ;
- `userType` ;
- `organizationSegment` ;
- `partnerId` ;
- `volumeBand` ;
- `pricingMode` ;
- `fixedMinor` ;
- `percentageBps` ;
- `minimumMinor` ;
- `maximumMinor` ;
- `freeOperationCount` ;
- `tierDefinition` ;
- `promotionId` ;
- `commissionSplitDefinition` ;
- `taxPolicyId` ;
- `effectiveFrom` ;
- `effectiveTo` ;
- `status` ;
- `version` ;
- `approvedBy` ;
- `publishedAt`.

### 26.4 Cycle de changement tarifaire

États : `DRAFT`, `SIMULATED`, `PENDING_APPROVAL`, `APPROVED`, `SCHEDULED`, `ACTIVE`, `EXPIRED`, `RETIRED`, `REJECTED`.

Règles :

1. modification depuis l’administration sans modifier le code ;
2. simulation obligatoire avant publication pour changement sensible ;
3. comparaison ancienne/nouvelle règle ;
4. estimation d’impact sur transactions historiques simulées ;
5. approbation par rôle autorisé ;
6. date d’effet explicite ;
7. date de fin facultative ;
8. versioning immuable ;
9. audit immuable ;
10. rollback par nouvelle version, jamais par réécriture de l’ancienne.

### 26.5 Snapshot transactionnel

Toute transaction B2B conserve :

- `pricingRuleId` ;
- `pricingRuleVersion` ;
- frais fixes appliqués ;
- pourcentage appliqué ;
- minimum/maximum effectif ;
- promotion ;
- taxes ;
- commissions par bénéficiaire ;
- montant brut ;
- montant net ;
- devise ;
- horodatage de pricing.

Une modification future du pricing ne change jamais les transactions passées.

---

## 27. API B2B

Les API réutilisent le module 12 et doivent appliquer les permissions organisationnelles.

Exemples d’endpoints :

- `POST /v1/organizations` ;
- `GET /v1/organizations/{id}` ;
- `GET /v1/organizations/{id}/members` ;
- `POST /v1/organizations/{id}/members/invitations` ;
- `POST /v1/organizations/{id}/beneficiaries` ;
- `POST /v1/organizations/{id}/payments` ;
- `POST /v1/organizations/{id}/bulk-payments` ;
- `GET /v1/organizations/{id}/expenses` ;
- `POST /v1/organizations/{id}/expenses/{expenseId}/submit` ;
- `POST /v1/organizations/{id}/approvals/{id}/approve` ;
- `POST /v1/organizations/{id}/approvals/{id}/reject` ;
- `GET /v1/organizations/{id}/reports` ;
- `GET /v1/organizations/{id}/audit-logs` ;
- `POST /v1/organizations/{id}/pricing/simulate` si autorisé.

Toutes les écritures utilisent une clé d’idempotence quand pertinent.

Les réponses financières retournent devise et unité explicitement.

---

## 28. Webhooks

Événements recommandés :

- `organization.activated` ;
- `organization.restricted` ;
- `member.invited` ;
- `member.activated` ;
- `member.offboarded` ;
- `beneficiary.created` ;
- `beneficiary.approved` ;
- `payment.created` ;
- `payment.approval_required` ;
- `payment.processing` ;
- `payment.settled` ;
- `payment.failed` ;
- `expense.submitted` ;
- `expense.approved` ;
- `expense.rejected` ;
- `card.frozen` ;
- `budget.threshold_reached` ;
- `reconciliation.mismatch_detected` ;
- `pricing.version_activated`.

Exigences :

- signature ;
- timestamp ;
- ID unique ;
- retry exponentiel ;
- DLQ ;
- ordre non garanti explicitement documenté ;
- récupération par API ;
- secret rotatif ;
- test webhook depuis sandbox.

---

## 29. Feature flags

Flags possibles :

- `b2b.enabled` ;
- `b2b.multi_entity.enabled` ;
- `b2b.cards.enabled` ;
- `b2b.bulk_payments.enabled` ;
- `b2b.expenses.enabled` ;
- `b2b.approvals.enabled` ;
- `b2b.multi_currency.enabled` ;
- `b2b.accounting_connectors.enabled` ;
- `b2b.api.enabled` ;
- `b2b.offline_capture.enabled` ;
- `b2b.advanced_fraud_controls.enabled`.

Ciblage possible par :

- pays ;
- organisation ;
- segment ;
- environnement ;
- partenaire ;
- plan commercial ;
- version application.

Un flag désactivé ne doit pas laisser un endpoint d’écriture critique accessible par contournement.

---

## 30. Administration MANSA

La console Super Admin doit permettre :

- recherche organisation ;
- vue KYB ;
- vue risques ;
- entités ;
- membres ;
- rôles ;
- wallets ;
- cartes ;
- bénéficiaires ;
- paiements ;
- approbations ;
- dépenses ;
- incidents ;
- webhooks ;
- intégrations ;
- feature flags ;
- pricing ;
- commissions ;
- taxes ;
- limites ;
- restrictions ;
- audit ;
- réconciliation ;
- support.

Les actions support ne doivent pas permettre de contourner le ledger ou de modifier un historique financier.

---

## 31. Administration entreprise

La console entreprise doit proposer des espaces :

- Accueil ;
- Soldes ;
- Paiements ;
- Encaissements ;
- Cartes ;
- Dépenses ;
- Factures ;
- Budgets ;
- Équipes ;
- Approbations ;
- Bénéficiaires ;
- Abonnements ;
- Trésorerie ;
- Devises ;
- Rapports ;
- Intégrations ;
- API ;
- Sécurité ;
- Audit ;
- Paramètres.

Chaque menu est conditionné par permission et feature flag.

---

## 32. Sécurité

### 32.1 Authentification

- MFA obligatoire pour rôles sensibles ;
- step-up pour paiements élevés ;
- gestion de sessions ;
- révocation ;
- détection nouvel appareil ;
- limitation tentative ;
- support SSO entreprise ultérieur via abstraction.

### 32.2 Secrets et données sensibles

- aucun secret dans dépôt ;
- secrets via vault/secret manager ;
- chiffrement en transit ;
- chiffrement au repos pour données sensibles ;
- tokenisation des destinations de paiement quand possible ;
- masquage UI ;
- rotation des credentials ;
- séparation environnements.

### 32.3 Actions critiques

Nécessitent au minimum :

- vérification permission ;
- vérification contexte ;
- step-up selon risque ;
- audit ;
- idempotence ;
- contrôles fraude ;
- validation de limite ;
- pricing snapshot ;
- écriture ledger atomique ou orchestrée de façon sûre.

---

## 33. Audit immuable

### 33.1 AuditEvent

- `id` ;
- `organizationId` ;
- `actorType` ;
- `actorId` ;
- `action` ;
- `resourceType` ;
- `resourceId` ;
- `beforeHash` ;
- `afterHash` ;
- `requestId` ;
- `sessionId` ;
- `ipMetadata` minimisée ;
- `deviceMetadata` minimisée ;
- `countryContext` ;
- `reason` ;
- `createdAt`.

Événements critiques :

- rôle ajouté ;
- permission modifiée ;
- bénéficiaire modifié ;
- compte de règlement modifié ;
- limite modifiée ;
- politique modifiée ;
- paiement approuvé ;
- pricing modifié ;
- intégration activée ;
- secret tourné ;
- membre suspendu ;
- export sensible lancé.

Les audits ne doivent pas exposer de secrets, tokens ou données de carte complètes.

---

## 34. Fraude et risque

### 34.1 Signaux

- nouveau bénéficiaire ;
- montant inhabituel ;
- fréquence inhabituelle ;
- changement soudain de rôle ;
- nouvel appareil ;
- pays inhabituel ;
- heure inhabituelle ;
- modification de destination puis paiement ;
- batch anormal ;
- dépenses fractionnées ;
- utilisation anormale de carte ;
- répétition d’échecs ;
- mismatch KYB ;
- comportement API anormal.

### 34.2 Actions

- autoriser ;
- exiger step-up ;
- exiger approbation supplémentaire ;
- retarder ;
- mettre en revue ;
- bloquer ;
- suspendre un canal ;
- geler une carte ;
- créer incident.

Les règles antifraude doivent être versionnées et testables. Un score ne doit pas constituer à lui seul une preuve de fraude.

---

## 35. Données minimisées et confidentialité

Principes :

- collecter uniquement les données utiles ;
- limiter les données collaborateurs visibles aux administrateurs ;
- séparer données personnelles et organisationnelles ;
- durées de conservation configurables ;
- export et suppression selon obligations légales ;
- masquage des comptes et identifiants ;
- pas de données sensibles dans logs applicatifs ;
- contrôle d’accès aux justificatifs ;
- consentement et base légale selon pays ;
- localisation ou transfert international évalués avant activation réelle.

---

## 36. Multi-pays

Chaque capacité B2B est évaluée par `CountryCapability`.

Exemples :

- onboarding entreprise ;
- type de document ;
- cartes ;
- Mobile Money ;
- banque ;
- virement ;
- devise ;
- taxes ;
- paiement de masse ;
- remboursement ;
- facturation ;
- conservation documentaire.

Un pays peut être : `DISABLED`, `SANDBOX_ONLY`, `PILOT`, `ACTIVE`, `RESTRICTED`.

Les règles de pays sont configurables et versionnées.

---

## 37. Multi-devises

Tous les montants incluent :

- valeur ;
- devise ;
- unité mineure ;
- éventuel taux ;
- source de taux ;
- timestamp ;
- version pricing.

Les conversions passent uniquement par le module 13.

Aucune somme de montants en devises différentes n’est permise sans conversion d’affichage explicitement identifiée comme indicative.

---

## 38. Réseau faible et hors ligne

Le B2B peut nécessiter un mode dégradé pour agents terrain, commerçants ou équipes mobiles.

Autorisé hors ligne selon politique :

- consultation de données mises en cache non sensibles ;
- création de brouillon de dépense ;
- capture de justificatif ;
- préparation d’un batch ;
- préparation d’un formulaire ;
- file locale chiffrée.

Non autorisé par défaut hors ligne :

- confirmation finale d’un paiement ;
- modification de bénéficiaire critique ;
- changement de rôle ;
- changement pricing ;
- opération nécessitant solde temps réel ;
- conversion FX exécutable.

À reconnexion :

- synchronisation idempotente ;
- détection conflit ;
- revalidation des limites ;
- revalidation des permissions ;
- revalidation du pricing ;
- revalidation du statut organisation ;
- expiration des brouillons sensibles selon durée.

---

## 39. Intégrations partenaires abstraites

Interfaces recommandées :

- `BankingProvider` ;
- `MobileMoneyProvider` ;
- `CardIssuerProvider` ;
- `CardAcquirerProvider` ;
- `PayoutProvider` ;
- `FxProvider` ;
- `AccountingProvider` ;
- `IdentityVerificationProvider` ;
- `BusinessRegistryProvider` ;
- `TaxProvider` ;
- `NotificationProvider`.

Chaque adaptateur expose :

- capabilities ;
- country support ;
- currency support ;
- health ;
- timeout policy ;
- idempotency support ;
- reconciliation support ;
- webhook verification ;
- sandbox/prod separation.

Le routeur ne doit jamais sélectionner un partenaire simplement parce qu’un adaptateur logiciel existe. L’activation exige une configuration contractuelle réelle.

---

## 40. Notifications

Canaux :

- push ;
- email ;
- SMS si disponible ;
- notification in-app ;
- webhook ;
- Jini selon autorisation future.

Événements :

- approbation requise ;
- paiement exécuté ;
- paiement échoué ;
- budget proche limite ;
- carte gelée ;
- justificatif manquant ;
- bénéficiaire modifié ;
- rôle modifié ;
- connexion suspecte ;
- KYB à renouveler ;
- webhook en échec ;
- changement pricing à venir si contractuellement requis.

---

## 41. Observabilité

Métriques :

- taux de succès paiements ;
- latence ;
- volume ;
- montant ;
- erreurs partenaires ;
- approbations en attente ;
- batches partiels ;
- écarts de réconciliation ;
- dépenses hors politique ;
- webhooks échoués ;
- utilisateurs actifs entreprise ;
- taux de réussite KYB ;
- disponibilité adaptateurs.

Logs structurés avec `requestId`, `organizationId`, `operationType`, sans données sensibles.

Tracing distribué pour les parcours impliquant plusieurs services.

---

## 42. Résilience

Exigences :

- idempotence ;
- retries contrôlés ;
- circuit breakers ;
- timeout ;
- DLQ ;
- outbox transactionnelle ;
- reprise après panne ;
- state machines persistées ;
- rapprochement externe ;
- compensation plutôt que réécriture ;
- backpressure sur batchs.

Aucun retry automatique ne doit doubler un paiement.

---

## 43. Performance

Cibles initiales à affiner par environnement :

- lecture dashboard p95 < 800 ms hors dépendances externes lentes ;
- API interne simple p95 < 500 ms ;
- création d’intention p95 < 700 ms ;
- capacité batch asynchrone ;
- pagination obligatoire ;
- exports lourds asynchrones ;
- cache pour référentiels ;
- aucun calcul de rapport massif synchrone dans une requête utilisateur.

Les SLA partenaires sont séparés des SLA internes.

---

## 44. Tests fonctionnels

Scénarios minimaux :

1. création organisation ;
2. onboarding KYB ;
3. invitation membre ;
4. affectation rôle ;
5. refus d’une permission non autorisée ;
6. création centre de coût ;
7. création budget ;
8. création bénéficiaire ;
9. approbation bénéficiaire ;
10. paiement simple ;
11. double approbation ;
12. rejet ;
13. changement montant après approbation ;
14. batch valide ;
15. batch partiellement invalide ;
16. retry sans double débit ;
17. dépense avec justificatif ;
18. dépense hors politique ;
19. carte gelée ;
20. dépassement budget ;
21. conversion via module 13 ;
22. pricing fixe ;
23. pricing pourcentage ;
24. pricing fixe + pourcentage ;
25. minimum/maximum ;
26. palier ;
27. nombre d’opérations gratuites ;
28. promotion ;
29. commission multiple ;
30. taxe séparée ;
31. activation future d’un tarif ;
32. transaction historique inchangée après changement tarifaire ;
33. restriction pays ;
34. restriction devise ;
35. révocation membre ;
36. délégation expirée ;
37. webhook retry ;
38. rapprochement mismatch ;
39. partenaire timeout ;
40. mode réseau faible.

---

## 45. Tests sécurité

- privilege escalation ;
- IDOR inter-organisation ;
- accès cross-tenant ;
- injection ;
- mass assignment ;
- contournement approbation ;
- replay ;
- réutilisation idempotency key avec payload différent ;
- session volée ;
- MFA bypass ;
- token webhook falsifié ;
- secret exposé ;
- export non autorisé ;
- brute force ;
- changement bénéficiaire frauduleux ;
- modification pricing non autorisée ;
- accès à carte complète ;
- upload fichier malveillant ;
- SSRF dans intégrations ;
- séparation sandbox/prod.

---

## 46. Tests de résilience

- timeout bancaire ;
- webhook dupliqué ;
- webhook hors ordre ;
- crash après réservation ;
- crash après envoi partenaire mais avant réponse ;
- redémarrage worker ;
- DLQ ;
- perte Redis ;
- DB failover ;
- latence élevée ;
- batch 10 000 lignes ;
- double soumission utilisateur ;
- réconciliation tardive ;
- partenaire retourne statut inconnu ;
- quote FX expiré ;
- fichier justificatif indisponible.

---

## 47. Tests de performance

- 1 000 organisations actives simultanées ;
- dashboards concurrents ;
- créations de paiement ;
- approbations ;
- batchs ;
- exports ;
- webhooks ;
- recherches audit ;
- filtres ;
- factures ;
- dépenses ;
- cartes ;
- réconciliation.

Mesurer p50, p95, p99, erreurs, saturation DB, queue lag et dépendances.

---

## 48. Ordre de développement recommandé

### Phase 1 — Socle organisation

1. `Organization` ;
2. `LegalEntity` ;
3. `BusinessUnit` ;
4. `OrganizationMember` ;
5. invitations ;
6. RBAC/ABAC ;
7. audit ;
8. KYB.

### Phase 2 — Finance de base

9. BusinessWallet ;
10. centres de coûts ;
11. budgets ;
12. bénéficiaires ;
13. paiements ;
14. workflows d’approbation ;
15. pricing adapter ;
16. ledger et réconciliation.

### Phase 3 — Dépenses et cartes

17. dépenses ;
18. justificatifs ;
19. remboursements ;
20. cartes ;
21. politiques de dépense.

### Phase 4 — B2B avancé

22. bulk payments ;
23. encaissements ;
24. factures ;
25. abonnements ;
26. multi-devise ;
27. trésorerie ;
28. exports comptables.

### Phase 5 — Intégrations et industrialisation

29. API ;
30. webhooks ;
31. connecteurs ;
32. sandbox ;
33. observabilité ;
34. fraude avancée ;
35. performance ;
36. hardening sécurité.

---

## 49. Critères d’acceptation

Le module est considéré prêt pour une première production contrôlée uniquement si :

1. une organisation est isolée strictement des autres tenants ;
2. KYB peut être requis par configuration ;
3. rôles et permissions sont granulaires ;
4. ABAC gère montants, unités et pays ;
5. séparation des responsabilités est applicable ;
6. bénéficiaires nécessitent les contrôles configurés ;
7. paiements sont idempotents ;
8. workflows sont versionnés ;
9. modifications matérielles invalident les anciennes approbations ;
10. ledger est équilibré ;
11. réconciliation est disponible ;
12. cartes reposent sur partenaire abstrait ;
13. multi-devises réutilise module 13 ;
14. factures réutilisent module 7 ;
15. abonnements réutilisent module 8 ;
16. API réutilise module 12 ;
17. frais et commissions sont configurables sans code ;
18. fixe, pourcentage, fixe + pourcentage, min, max, paliers et gratuité fonctionnent ;
19. opérations gratuites et promotions fonctionnent ;
20. règles par pays, devise, canal, utilisateur, partenaire et volume fonctionnent ;
21. commissions MANSA, agent, commerçant, partenaire et apporteur sont séparables ;
22. taxes sont séparées ;
23. dates d’effet et de fin fonctionnent ;
24. simulation avant publication est disponible ;
25. changements sensibles peuvent nécessiter approbation ;
26. versioning tarifaire est immuable ;
27. transaction historique conserve son pricing snapshot ;
28. audit est immuable ;
29. webhooks sont signés et rejouables côté consommateur ;
30. aucune clé réelle n’est dans le code ou documentation ;
31. capacités partenaires désactivées sans contrat réel ;
32. contrôles fraude sont activables ;
33. données sont minimisées ;
34. réseau faible ne crée aucun double paiement ;
35. tests fonctionnels, sécurité, résilience et performance critiques passent.

---

## 50. Invariants à ne jamais violer

1. Un utilisateur d’une organisation ne peut jamais accéder aux données d’une autre organisation sans mandat explicite et autorisé.
2. Aucune opération financière réelle sans ledger et idempotence.
3. Aucun changement tarifaire rétroactif.
4. Aucun tarif sensible publié sans le workflow d’approbation configuré.
5. Aucun partenaire considéré actif uniquement parce que l’adaptateur existe.
6. Aucun montant sans devise.
7. Aucun calcul financier en flottant non contrôlé.
8. Aucun secret en clair dans logs, Git ou documentation.
9. Aucun rôle technique n’obtient implicitement le droit de déplacer des fonds.
10. Aucun support agent ne modifie l’historique financier.
11. Toute correction financière utilise une écriture compensatrice.
12. Tout changement sensible est auditable.
13. Toute transaction conserve ses frais, commissions, taxes et taux effectivement appliqués.
14. Le module 20 devra centraliser et vérifier l’ensemble des règles Pricing & Commission utilisées ici sans casser les snapshots historiques.

---

## 51. Définition de terminé

Le module 14 est considéré documenté lorsque ce cahier des charges sert de référence unique pour Mansa Entreprise / B2B avancé, que les concepts organisationnels sont compatibles avec les modules 7, 8, 12 et 13, que la tarification est déjà conçue pour migrer vers le moteur central du module 20, et qu’aucune intégration externe n’est présentée comme opérationnelle sans preuve contractuelle et technique.
