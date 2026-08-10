# Cahier des charges — Cycle de vie des comptes, clôture, inactivité et succession

## 1. Objet

Ce document définit les exigences Mansa relatives au cycle de vie complet d’un compte utilisateur, d’un wallet ou d’un accès organisationnel, depuis son activation jusqu’à sa suspension, son inactivité prolongée, sa fermeture, sa liquidation et son archivage.

Le domaine couvre les particuliers, commerçants, agents, entreprises, administrations, partenaires et comptes liés à des services spécialisés Mansa.

L’objectif est de garantir qu’un compte ne puisse jamais être fermé de manière incohérente avec les soldes, transactions, litiges, obligations réglementaires, cartes, mandats, crédits, séquestres, règlements, données de conformité ou droits d’accès encore actifs.

## 2. Principes directeurs

Mansa doit appliquer les principes suivants :

1. la fermeture d’un compte est un workflow métier contrôlé et non une simple suppression de ligne en base ;
2. aucun solde financier ne doit disparaître à la clôture ;
3. aucune transaction en cours ne doit être perdue ou rendue incohérente ;
4. un compte clôturé ne doit plus pouvoir initier de nouvelles opérations sauf workflow explicitement autorisé ;
5. les obligations légales de conservation priment sur une suppression immédiate des données ;
6. l’utilisateur doit pouvoir exporter les données et documents auxquels il a droit avant suppression ou archivage lorsque la politique le permet ;
7. la fermeture ne doit pas supprimer les journaux d’audit, écritures comptables, preuves de paiement, éléments réglementaires ou documents soumis à conservation ;
8. les accès d’un utilisateur à une organisation doivent être séparés de son compte personnel ;
9. le décès, la succession, la dissolution d’entreprise et la fermeture volontaire sont des scénarios distincts ;
10. toute action sensible doit être authentifiée, autorisée, auditée et réversible uniquement lorsque le statut le permet ;
11. les délais, motifs et politiques doivent être configurables par pays, produit, organisation et type de compte ;
12. les règles multi-tenant restent applicables pendant toute la durée du workflow ;
13. un compte bloqué pour fraude, sanction, litige ou décision d’autorité ne doit pas pouvoir contourner le blocage par une demande de fermeture ;
14. les données sensibles résiduelles doivent être minimisées après expiration des durées de conservation ;
15. Mansa ne doit jamais promettre une suppression physique immédiate lorsque des obligations légales, financières ou de sécurité imposent une conservation.

## 3. Périmètre fonctionnel

Le domaine comprend au minimum :

```text
ACCOUNT_LIFECYCLE
VOLUNTARY_CLOSURE
ADMINISTRATIVE_CLOSURE
DORMANCY
INACTIVITY
TEMPORARY_SUSPENSION
SECURITY_LOCK
COMPLIANCE_HOLD
LEGAL_HOLD
DECEASED_CUSTOMER
SUCCESSION
BUSINESS_DISSOLUTION
MERCHANT_OFFBOARDING
AGENT_OFFBOARDING
EMPLOYEE_ACCESS_REVOCATION
DATA_EXPORT_BEFORE_CLOSURE
FINANCIAL_LIQUIDATION
CARD_TERMINATION
TOKEN_TERMINATION
MANDATE_TERMINATION
ARCHIVE_AND_RETENTION
ANONYMIZATION_OR_DELETION
REOPENING_WHEN_ALLOWED
```

## 4. Types de comptes et ressources concernées

La politique doit couvrir au minimum :

```text
ConsumerAccount
UserIdentity
Wallet
SavingsAccount
CardAccount
VirtualCard
PhysicalCard
MerchantAccount
AgentAccount
BusinessAccount
BusinessMembership
StateOrganizationAccess
DeveloperAccount
ApiCredential
EscrowAccount
CreditAccount
Subscription
DeviceRegistration
TelephonyProfile
```

La fermeture d’une ressource ne doit pas automatiquement fermer toutes les autres sans règle explicite.

## 5. États du cycle de vie

États recommandés :

```text
PENDING_ACTIVATION
ACTIVE
LIMITED
SUSPENDED
SECURITY_LOCKED
COMPLIANCE_RESTRICTED
DORMANT
CLOSURE_REQUESTED
CLOSURE_REVIEW
LIQUIDATING
CLOSURE_BLOCKED
CLOSED
ARCHIVED
ANONYMIZED
```

Les transitions doivent être contrôlées par une machine d’état explicite.

## 6. Entités recommandées

```text
AccountLifecycleCase
AccountClosureRequest
ClosureEligibilityCheck
ClosureBlocker
FinancialLiquidation
BalanceDisposition
DormancyPolicy
DormancyEvent
LegalHold
ComplianceHold
SuccessionCase
SuccessionBeneficiary
BusinessOffboardingCase
DataExportRequest
RetentionSchedule
DeletionOrAnonymizationJob
LifecycleAuditEvent
ReopeningRequest
```

## 7. Demande de fermeture volontaire

Un utilisateur autorisé peut demander la fermeture depuis un canal activé :

```text
application client
web
support authentifié
agence / agent habilité
administration interne
API partenaire autorisée
```

La demande doit enregistrer :

```text
requestId
accountId
requesterId
requesterRole
reasonCode
freeTextReason?
channel
requestedAt
countryCode
policyVersion
status
```

## 8. Vérification d’éligibilité

Avant d’accepter une fermeture définitive, Mansa doit vérifier au minimum :

- soldes disponibles ;
- soldes réservés ;
- transactions en attente ;
- virements en cours ;
- remboursements en attente ;
- chargebacks et litiges ;
- séquestres actifs ;
- crédits ou dettes ;
- commissions dues ;
- règlements commerçants ;
- float agent ;
- cartes actives ;
- abonnements ;
- prélèvements ou mandats ;
- obligations KYC/KYB ou conformité ;
- investigations fraude ;
- sanctions ou gel légal ;
- procédures de succession ;
- obligations fiscales ou administratives ;
- appareils et sessions actifs ;
- clés/API actives pour les comptes professionnels.

## 9. ClosureBlocker

Chaque motif empêchant la clôture doit être représenté explicitement.

Types recommandés :

```text
NON_ZERO_BALANCE
RESERVED_FUNDS
PENDING_TRANSACTION
ACTIVE_DISPUTE
ACTIVE_ESCROW
OUTSTANDING_DEBT
ACTIVE_CREDIT
PENDING_SETTLEMENT
ACTIVE_CARD
ACTIVE_MANDATE
COMPLIANCE_HOLD
LEGAL_HOLD
FRAUD_INVESTIGATION
SUCCESSION_CASE
BUSINESS_OBLIGATION
UNRECONCILED_CASH
OTHER
```

Un blocker doit contenir sa source, sa date, son statut et le moyen de résolution attendu.

## 10. Solde positif

Si un compte possède un solde positif, le système ne doit jamais le supprimer à la fermeture.

Options selon politique :

```text
TRANSFER_TO_ANOTHER_MANSA_ACCOUNT
BANK_TRANSFER
MOBILE_MONEY_TRANSFER
CASH_OUT_VIA_AUTHORIZED_AGENT
REFUND_TO_ORIGIN_WHEN_SUPPORTED
SUCCESSION_DISBURSEMENT
STATE_OR_LEGAL_DISPOSITION
```

Le canal disponible dépend du pays, du partenaire, du montant, de la conformité et du type de compte.

## 11. Solde négatif ou dette

Un compte avec dette ne peut être considéré comme financièrement liquidé tant que la dette n’est pas résolue ou transférée vers un processus de recouvrement autorisé.

Le système doit distinguer :

```text
amountDue
feesDue
creditPrincipalDue
interestDue
chargebackLiability
merchantReserveLiability
agentCashDifference
```

La fermeture d’accès peut être possible sans effacer la créance.

## 12. Transactions en attente

Les opérations non finalisées doivent suivre leur cycle normal.

Une fermeture demandée ne doit jamais transformer artificiellement :

```text
PENDING -> CANCELLED
AUTHORIZED -> FAILED
SETTLING -> COMPLETED
```

sans événement métier légitime.

Le compte peut passer en `CLOSURE_REVIEW` jusqu’à stabilisation des opérations.

## 13. Transactions tardives

Le système doit prévoir les événements reçus après la demande de fermeture :

- remboursement tardif ;
- reversal réseau ;
- chargeback ;
- règlement partenaire ;
- correction de rapprochement ;
- retour de virement ;
- ajustement réglementaire.

Un compte fermé doit conserver une capacité comptable passive permettant de recevoir les écritures nécessaires sans réactiver les droits transactionnels de l’utilisateur.

## 14. Cartes physiques et virtuelles

À la fermeture :

```text
ACTIVE -> TERMINATION_PENDING -> TERMINATED
```

Le système doit :

- bloquer les nouvelles autorisations ;
- révoquer les tokens de carte lorsque possible ;
- désactiver les cartes virtuelles ;
- enregistrer la raison ;
- conserver les références nécessaires aux remboursements et litiges ;
- ne jamais stocker ou afficher de données carte sensibles supplémentaires pour la clôture.

## 15. Wallets multiples

Si un utilisateur possède plusieurs wallets, la fermeture peut concerner :

```text
un seul wallet
un produit
un pays
le compte utilisateur complet
```

La portée doit être explicitement confirmée.

## 16. Abonnements et paiements récurrents

Le workflow doit identifier les abonnements actifs et permettre selon politique :

```text
CANCEL
TRANSFER
KEEP_UNTIL_PERIOD_END
REQUIRE_USER_ACTION
```

Un abonnement externe non contrôlé par Mansa doit être signalé sans prétendre pouvoir le résilier automatiquement.

## 17. Mandats et autorisations

Les mandats de débit, procurations, accès délégués et autorisations persistantes doivent être révoqués ou clôturés selon leur propre cycle de vie.

La preuve de révocation doit être auditée.

## 18. Sessions et appareils

À la fermeture effective :

- révoquer les sessions actives ;
- révoquer les refresh tokens ;
- invalider les tokens applicatifs ;
- désenregistrer ou désautoriser les appareils selon politique ;
- empêcher les nouvelles connexions ;
- conserver l’audit des appareils sans conserver inutilement des secrets locaux.

## 19. Clés API et intégrations professionnelles

Pour un compte commerçant ou entreprise :

```text
API keys -> revoked
webhook signing secrets -> rotated/revoked
OAuth grants -> revoked
service accounts -> disabled
partner credentials -> disabled
```

Aucun secret ne doit être affiché dans les journaux de clôture.

## 20. Commerçants

La fermeture d’un commerçant exige des contrôles supplémentaires :

- transactions récentes ;
- remboursements possibles ;
- chargebacks futurs ;
- réserve financière ;
- règlements en attente ;
- factures ;
- abonnements ;
- employés ;
- TPE et terminaux ;
- stock ou services Mansa optionnels ;
- obligations KYB ;
- litiges clients.

Le compte peut rester en état passif pendant une période de risque post-activité.

## 21. Réseau agents

La sortie d’un agent doit inclure :

```text
arrêt nouvelles opérations
clôture session caisse
rapprochement cash
rapprochement float
commissions dues
règlement final
restitution éventuelle matériel
révocation terminal
révocation accès
archive audit
```

Un écart de caisse doit pouvoir bloquer la liquidation finale sans effacer le dossier.

## 22. Entreprises et organisations

Une entreprise peut fermer :

- un utilisateur ;
- une équipe ;
- une filiale ;
- un établissement ;
- un wallet ;
- l’organisation complète.

La suppression d’un employé ne doit pas supprimer l’historique des actions réalisées pour l’entreprise.

## 23. Départ d’un employé

Le workflow d’offboarding doit permettre :

```text
revokeAccess()
revokeSessions()
transferOwnership()
transferApprovals()
transferPendingTasks()
reassignCards()
reassignBudgets()
archiveMembership()
```

Les actions déjà signées ou approuvées doivent conserver l’identité historique de leur auteur.

## 24. Administrations et secteur public

Les comptes d’agents publics doivent être rattachés à l’organisation et au mandat administratif.

Le départ ou changement d’affectation doit :

- désactiver les droits sur les postes précédents ;
- conserver les opérations et audits ;
- transférer les responsabilités en attente ;
- ne jamais permettre à l’ancien agent de modifier rétroactivement les recettes ou événements.

Pour les péages, une clôture d’accès opérateur ne doit jamais effacer les rapprochements véhicule/paiement, ouvertures de barrière, événements de voie, sessions espèces ou audits anti-corruption.

## 25. Péages — exigences de référence conservées

Les décisions de référence restent obligatoires :

- coexistence d’un péage automatique classique avec barrière et d’un télépéage RFID avec barrière ;
- free-flow futur optionnel sans remplacement des deux solutions initiales ;
- paiement classique configurable : billets et pièces FCFA, EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money ;
- Mobile Money configurable par niveau national, réseau, poste ou voie, avec date d’effet et audit ;
- RFID UHF passif associé au véhicule et au compte, lecteur/antenne, contrôleur local, relais OPEN, barrière et capteurs ;
- fonctionnement hors ligne sécurisé et resynchronisation sans double débit ;
- matériel multi-fournisseurs derrière adaptateurs ;
- voie automatique complète, voie semi-automatique et poste numérisé à faible coût ;
- déploiement progressif ;
- matériel acheté par l’État/concessionnaire ou fourni/intégré/revendu par Mansa ;
- marque blanche État/concessionnaire avec `Propulsé par Mansa` facultatif ;
- anti-corruption par rapprochement véhicule, catégorie, tarif, paiement, ouverture et passage physique ;
- ouverture manuelle toujours auditée.

La fermeture d’un compte de télépéage doit désactiver l’autorisation du tag et du véhicule sans supprimer l’historique des passages.

## 26. Inactivité

Mansa doit mesurer l’inactivité par dimensions distinctes :

```text
lastLoginAt
lastAuthenticatedActionAt
lastFinancialActivityAt
lastCardActivityAt
lastMerchantActivityAt
lastAgentActivityAt
```

Une simple absence de connexion ne signifie pas nécessairement absence d’activité financière.

## 27. Dormance

Une politique `DormancyPolicy` peut définir :

```text
inactivityThresholdDays
warningDelayDays
restrictAfterDays
closeAfterDays?
feesAllowed
notificationPolicy
reactivationPolicy
countryCode
productType
```

Les seuils doivent être configurables et juridiquement validés par pays.

## 28. Passage en compte dormant

Workflow recommandé :

```text
activité normale
-> seuil d’inactivité
-> notification préventive
-> nouvelle vérification
-> DORMANT
-> restrictions éventuelles
-> réactivation ou traitement selon politique
```

Aucun frais de dormance ne doit être inventé si la politique produit ou réglementation ne l’autorise pas.

## 29. Réactivation d’un compte dormant

La réactivation peut nécessiter :

- authentification forte ;
- vérification de l’identité ;
- mise à jour KYC ;
- confirmation du numéro ;
- vérification d’appareil ;
- contrôle fraude ;
- acceptation de nouvelles conditions.

La politique doit être proportionnée au risque.

## 30. Suspension temporaire

Une suspension n’est pas une fermeture.

Motifs possibles :

```text
USER_REQUEST
SECURITY_RISK
LOST_DEVICE
FRAUD_RISK
KYC_EXPIRED
COMPLIANCE_REVIEW
LEGAL_ORDER
OPERATIONAL_INCIDENT
```

La suspension doit préciser quelles fonctions sont bloquées et lesquelles restent permises.

## 31. Gel conformité

Un `ComplianceHold` peut empêcher :

- retrait ;
- transfert ;
- clôture ;
- modification d’identité ;
- suppression de données ;
- changement de bénéficiaire.

Les raisons détaillées peuvent être restreintes aux rôles habilités.

## 32. Gel légal

Un `LegalHold` doit conserver les données ou fonds concernés tant que l’ordre applicable reste actif.

Le système doit enregistrer :

```text
holdId
scope
legalAuthorityReference
countryCode
startedAt
expiresAt?
status
createdBy
releasedAt?
releaseAuthorityReference?
```

Les références sensibles doivent être protégées par RBAC.

## 33. Client décédé

Le décès ne doit jamais être traité comme une simple fermeture volontaire.

Un `SuccessionCase` doit permettre :

```text
DEATH_REPORTED
EVIDENCE_PENDING
UNDER_REVIEW
ACCOUNT_RESTRICTED
BENEFICIARIES_REVIEW
DISBURSEMENT_PENDING
COMPLETED
REJECTED
```

## 34. Preuve de décès

Les documents acceptables dépendent du pays et de la procédure définie avec les partenaires juridiques/compliance.

Mansa doit stocker uniquement les pièces nécessaires et appliquer les durées de conservation prévues.

## 35. Succession

Le système doit permettre :

- gel adapté du compte ;
- identification des ayants droit ou représentants autorisés ;
- contrôle des documents ;
- validation manuelle renforcée ;
- calcul du solde transmissible ;
- traitement des dettes, litiges et opérations tardives ;
- distribution selon instruction juridiquement validée ;
- génération d’un relevé de liquidation ;
- audit complet.

Mansa ne doit pas déterminer seul les règles successorales applicables lorsque cela relève du droit local.

## 36. Entreprise dissoute

La dissolution d’une organisation doit distinguer :

```text
cessation activité
liquidation
fusion/acquisition
radiation
fermeture volontaire
fermeture administrative
```

Les bénéficiaires finaux des fonds doivent être déterminés selon les mandats et documents valides.

## 37. Export des données avant clôture

Lorsque permis, l’utilisateur doit pouvoir demander un export avant fermeture.

L’export peut contenir :

```text
profil
historique transactions
relevés
reçus
bénéficiaires
budgets
factures
paramètres exportables
consentements
```

Il ne doit jamais contenir :

```text
PIN
CVV
clés privées
secrets API
secrets de signature
hash internes réutilisables
règles antifraude confidentielles
```

## 38. Formats d’export

Formats possibles :

```text
PDF
CSV
JSON
ZIP chiffré selon politique
```

Les exports contenant des données personnelles doivent utiliser un mécanisme de téléchargement temporaire et contrôlé.

## 39. Délai de grâce

Une politique peut prévoir une période :

```text
CLOSURE_REQUESTED -> grace period -> CLOSED
```

Pendant cette période, Mansa peut permettre l’annulation de la demande si aucun blocage réglementaire ou événement irréversible n’est intervenu.

## 40. Confirmation de fermeture

La confirmation doit indiquer clairement :

- portée de la fermeture ;
- produits concernés ;
- conséquences principales ;
- traitement du solde ;
- accès futur aux documents si applicable ;
- délai éventuel ;
- opérations qui continueront à être traitées ;
- impossibilité éventuelle de réouverture.

## 41. Authentification de la demande

Selon le risque, la demande peut exiger :

```text
password/session proof
OTP
biométrie locale liée à une session valide
step-up authentication
support verification
```

Aucun code secret financier ne doit être demandé dans un canal non prévu.

## 42. Annulation de la demande

Une demande peut être annulée uniquement si :

- la politique le permet ;
- le compte n’est pas déjà définitivement fermé ;
- aucune liquidation irréversible n’a été exécutée ;
- aucun ordre légal ne l’interdit.

L’annulation doit être auditée.

## 43. Fermeture administrative

Mansa ou une organisation habilitée peut initier une fermeture pour :

```text
fraude confirmée
violation contractuelle
risque inacceptable
fin de partenariat
compte dupliqué résolu
obligation réglementaire
cessation de service
```

La décision doit respecter les autorisations et politiques applicables.

## 44. Notifications

Les notifications peuvent couvrir :

```text
closure_requested
closure_blocked
closure_action_required
closure_scheduled
closure_completed
dormancy_warning
dormant_status
reactivation_success
succession_case_update
```

Aucune notification ne doit révéler publiquement un motif de fraude, sanction ou procédure sensible.

## 45. Documents de clôture

Mansa doit pouvoir générer :

```text
CLOSURE_CONFIRMATION
FINAL_ACCOUNT_STATEMENT
FINAL_BALANCE_CERTIFICATE
MERCHANT_FINAL_SETTLEMENT
AGENT_FINAL_COMMISSION_STATEMENT
SUCCESSION_SETTLEMENT_STATEMENT
BUSINESS_OFFBOARDING_REPORT
```

Ces documents doivent respecter le cahier des charges des relevés et attestations Mansa.

## 46. Conservation

La fermeture logique d’un compte ne supprime pas automatiquement les données.

Chaque catégorie doit être reliée à une `RetentionSchedule` :

```text
category
legalBasis
countryCode
retentionDuration
retentionStartEvent
minimumRetention
maximumRetention?
actionAfterExpiry
```

## 47. Suppression ou anonymisation

Après expiration des obligations applicables, le système peut :

```text
DELETE
ANONYMIZE
PSEUDONYMIZE
ARCHIVE_RESTRICTED
KEEP_IF_LEGAL_HOLD
```

L’action dépend de la catégorie de donnée.

## 48. Données comptables

Les écritures du ledger ne doivent jamais être modifiées pour simuler une suppression de compte.

Les identifiants personnels peuvent être minimisés ou séparés lorsque la politique le permet, mais l’intégrité comptable doit rester vérifiable.

## 49. Recherche après fermeture

Les opérateurs autorisés doivent pouvoir retrouver un compte fermé pour :

- audit ;
- litige ;
- remboursement ;
- chargeback ;
- demande réglementaire ;
- succession ;
- support historique.

L’accès doit être plus restrictif qu’un compte actif et entièrement journalisé.

## 50. Réouverture

La réouverture ne doit pas être supposée possible.

Politiques :

```text
NOT_ALLOWED
ALLOWED_DURING_GRACE_PERIOD
ALLOWED_WITH_REVERIFICATION
CREATE_NEW_ACCOUNT_ONLY
```

Un nouveau compte ne doit pas réutiliser silencieusement des identifiants techniques historiques si cela crée une confusion comptable ou de conformité.

## 51. Numéro de téléphone réattribué

La réutilisation d’un numéro téléphonique par un opérateur ne doit jamais donner accès à l’ancien compte.

La récupération doit reposer sur plusieurs preuves et sur la politique d’identité Mansa.

## 52. E-mail réattribué ou compromis

Un e-mail seul ne doit pas suffire à rouvrir ou récupérer un compte fermé ou dormant lorsque le niveau de risque exige des preuves supplémentaires.

## 53. Compte mineur devenu majeur

Si un produit accepte les mineurs, le changement de majorité peut déclencher :

- mise à jour du consentement ;
- changement de responsable ;
- nouvelle vérification KYC ;
- transfert de contrôle ;
- nouvelles limites.

Il ne doit pas être traité comme une fermeture automatique.

## 54. Comptes liés

Le système doit identifier les relations :

```text
parent/child
joint account
business owner
merchant employee
agent supervisor
state organization membership
beneficiary
legal representative
```

La clôture d’un acteur ne doit pas supprimer les droits légitimes des autres acteurs.

## 55. Comptes joints ou multi-signataires

Une fermeture peut nécessiter plusieurs approbations.

La politique doit définir :

```text
requiredApprovals
eligibleApprovers
approvalExpiry
disputeProcess
```

## 56. Idempotence

Les endpoints de clôture et liquidation doivent être idempotents.

Exemple :

```text
POST /closure-requests
Idempotency-Key: ...
```

Une répétition réseau ne doit pas créer deux liquidations ou deux virements du solde final.

## 57. Concurrence

Le système doit gérer les courses entre :

```text
closure request
incoming transfer
card authorization
refund
settlement
compliance hold
support action
```

Les décisions financières doivent utiliser verrouillage logique, transactions base de données ou mécanismes de concurrence adaptés.

## 58. Permissions

Permissions recommandées :

```text
account.closure.request.self
account.closure.cancel.self
account.closure.read.self
account.closure.review
account.closure.approve
account.closure.force
account.dormancy.manage
account.legal_hold.manage
account.succession.review
account.succession.approve
account.data_export.request
account.retention.admin
```

Les permissions privilégiées doivent être limitées et auditables.

## 59. Séparation des tâches

Pour les cas sensibles :

```text
requester != approver
reviewer != finalDisbursementApprover
supportAgent != complianceOverrideApprover
```

Les exceptions doivent être documentées et auditées.

## 60. Audit

Événements recommandés :

```text
CLOSURE_REQUESTED
CLOSURE_ELIGIBILITY_CHECKED
CLOSURE_BLOCKED
CLOSURE_BLOCKER_RESOLVED
CLOSURE_APPROVED
LIQUIDATION_STARTED
BALANCE_DISBURSED
CARDS_TERMINATED
ACCESS_REVOKED
ACCOUNT_CLOSED
ACCOUNT_ARCHIVED
ACCOUNT_ANONYMIZED
DORMANCY_WARNING_SENT
ACCOUNT_MARKED_DORMANT
ACCOUNT_REACTIVATED
LEGAL_HOLD_APPLIED
LEGAL_HOLD_RELEASED
SUCCESSION_OPENED
SUCCESSION_COMPLETED
```

Chaque événement doit contenir acteur, timestamp, scope, source et correlationId.

## 61. API interne recommandée

```text
POST   /account-closures
GET    /account-closures/:id
POST   /account-closures/:id/cancel
POST   /account-closures/:id/recheck
POST   /account-closures/:id/approve
POST   /account-closures/:id/liquidate
GET    /account-closures/:id/blockers
POST   /accounts/:id/dormancy/reactivate
POST   /legal-holds
POST   /legal-holds/:id/release
POST   /succession-cases
GET    /succession-cases/:id
POST   /data-exports
```

Les routes exposées publiquement doivent être séparées des routes opérateur.

## 62. Événements de domaine

```text
account.closure.requested
account.closure.blocked
account.closure.approved
account.liquidation.started
account.liquidation.completed
account.closed
account.dormant
account.reactivated
account.legal_hold.applied
account.succession.opened
account.succession.completed
```

Les consommateurs doivent être idempotents.

## 63. Intégrations

Le domaine peut interagir avec :

- ledger ;
- wallets ;
- cartes ;
- paiement ;
- KYC/KYB ;
- fraude ;
- conformité ;
- crédit ;
- épargne ;
- séquestre ;
- facturation ;
- agents ;
- commerçants ;
- secteur public ;
- notifications ;
- documents ;
- stockage ;
- IAM ;
- support.

## 64. Sécurité

Le service doit appliquer au minimum :

- authentification forte pour actions critiques ;
- RBAC et scopes ;
- isolation multi-tenant ;
- validation stricte des entrées ;
- rate limiting ;
- protection CSRF pour interfaces concernées ;
- anti-replay ;
- idempotence ;
- chiffrement en transit et au repos selon politique ;
- secrets hors du dépôt ;
- audit immuable des décisions sensibles.

## 65. Tests unitaires

Tester au minimum :

- états et transitions ;
- blockers ;
- solde positif ;
- dette ;
- transactions pending ;
- dormance ;
- réactivation ;
- succession ;
- permissions ;
- idempotence.

## 66. Tests d’intégration

Scénarios recommandés :

```text
fermeture compte vide
fermeture avec solde
fermeture bloquée par transaction
fermeture bloquée par litige
fermeture commerçant avec règlement pending
sortie agent avec rapprochement cash
compte dormant puis réactivé
legal hold empêchant fermeture
succession avec liquidation finale
double appel de liquidation
événement tardif après fermeture
```

## 67. Tests négatifs de sécurité

Tester explicitement qu’un utilisateur ne peut pas :

- fermer le compte d’un autre utilisateur ;
- fermer un tenant voisin ;
- contourner un hold ;
- déclencher deux versements finaux ;
- réactiver un compte interdit ;
- télécharger un export d’un autre compte ;
- modifier un blocker réglementaire sans permission ;
- supprimer l’audit.

## 68. Observabilité

Métriques recommandées :

```text
closure_requests_total
closure_completion_duration
closure_blocked_total
closure_liquidation_failures
closure_balance_disposition_total
dormant_accounts_total
reactivation_success_rate
legal_holds_active
succession_cases_active
late_events_after_closure_total
```

## 69. Alertes

Alertes critiques :

- double liquidation détectée ;
- fermeture avec solde non disposé ;
- écriture financière rejetée après clôture ;
- hold contourné ;
- accès réussi à un compte fermé ;
- échec massif de révocation de sessions ;
- erreur de synchronisation avec partenaire carte ;
- incohérence ledger/clôture.

## 70. Administration

Le portail opérateur doit afficher :

```text
case status
blockers
balances
pending operations
holds
linked products
cards
settlements
compliance flags
required approvals
audit timeline
next allowed actions
```

Les informations sensibles doivent être masquées selon le rôle.

## 71. Support client

Le support doit pouvoir expliquer l’état sans pouvoir contourner les contrôles financiers ou conformité.

Réponses possibles :

```text
fermeture en cours
une opération doit être finalisée
un solde doit être transféré
vérification supplémentaire nécessaire
fermeture terminée
```

Les motifs confidentiels ne doivent pas être exposés inutilement.

## 72. UX

L’interface utilisateur doit :

- expliquer clairement les conséquences ;
- ne pas utiliser de dark patterns ;
- distinguer désactivation temporaire et fermeture définitive ;
- montrer les actions nécessaires ;
- permettre l’export avant fermeture lorsque disponible ;
- afficher le statut ;
- éviter de promettre une suppression immédiate non garantie.

## 73. Localisation

Tous les messages doivent passer par le système de localisation Mansa.

Le français et les langues activées par pays doivent être supportés conformément au cahier des charges i18n/localisation existant.

## 74. Hors ligne

Une fermeture définitive ne doit pas être finalisée uniquement hors ligne.

Les applications peuvent enregistrer une intention locale, mais la validation centrale doit vérifier les blockers et le ledger avant changement d’état final.

## 75. Compatibilité multi-pays

Les politiques suivantes doivent être configurables :

```text
dormancyThreshold
closureGracePeriod
retentionPeriods
legalHoldRules
successionRequirements
allowedBalanceDispositionMethods
requiredApprovals
notificationRules
```

Aucune règle juridique propre à un pays ne doit être codée en dur comme vérité globale.

## 76. Migration

Lors de l’introduction du module :

1. classifier les comptes existants ;
2. calculer les indicateurs d’activité ;
3. ne pas marquer rétroactivement des comptes dormants sans validation de politique ;
4. créer les historiques nécessaires ;
5. préserver les statuts existants ;
6. tester la compatibilité avec cartes, wallets et ledger.

## 77. Critères d’acceptation

Le module est acceptable lorsque :

- aucune fermeture ne peut détruire un solde ;
- les blockers sont explicites ;
- les opérations tardives restent comptabilisables ;
- les cartes et accès sont correctement révoqués ;
- l’inactivité et la dormance sont distinctes ;
- les cas succession et entreprise sont couverts ;
- l’export préalable est possible selon politique ;
- la conservation suit la gouvernance de données ;
- les tests négatifs multi-tenant passent ;
- la liquidation est idempotente ;
- l’audit est complet.

## 78. Résultat attendu

Mansa dispose d’un domaine de cycle de vie des comptes capable de gérer proprement fermeture volontaire, restrictions, dormance, liquidation, offboarding professionnel, succession, conservation et suppression différée, sans casser le ledger, la sécurité, les obligations réglementaires ni l’isolation multi-tenant.
