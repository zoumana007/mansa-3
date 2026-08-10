# Cahier des charges — Récupération de compte, appareils perdus et accès de confiance

## 1. Objet

Ce document définit les exigences Mansa relatives à la récupération d’accès à un compte lorsqu’un utilisateur ne peut plus utiliser son appareil, son numéro, son facteur d’authentification ou son moyen habituel de connexion.

Le domaine couvre notamment :

- téléphone perdu, volé, cassé ou réinitialisé ;
- changement de téléphone ;
- carte SIM perdue, remplacée ou potentiellement détournée ;
- changement de numéro ;
- oubli d’un code secret ou d’un facteur secondaire ;
- perte d’accès à une adresse e-mail ;
- compromission présumée du compte ;
- récupération après blocage de sécurité ;
- réinitialisation d’un appareil professionnel, TPE, terminal agent ou poste d’administration ;
- restauration d’accès pour une organisation, un commerçant, une administration ou un agent autorisé.

L’objectif est de permettre une récupération praticable au Mali et dans les futurs pays Mansa sans créer une voie de contournement de l’authentification, du KYC, du RBAC, du multi-tenant ou des contrôles anti-fraude.

La récupération de compte est un processus de sécurité critique. Elle ne doit jamais être traitée comme un simple changement de mot de passe.

## 2. Principes directeurs

Mansa doit appliquer les principes suivants :

1. aucun canal de récupération ne doit être plus faible que le risque du compte qu’il protège ;
2. la possession d’un numéro de téléphone ne suffit pas, à elle seule, à prouver l’identité ;
3. un changement récent de SIM, d’appareil, de numéro ou de comportement doit augmenter le niveau de risque ;
4. la récupération doit combiner plusieurs signaux indépendants lorsque le risque le justifie ;
5. un agent de support ne doit jamais pouvoir réinitialiser seul un compte financier sensible sans politique et traçabilité ;
6. toute récupération doit produire un journal d’audit complet ;
7. les facteurs précédemment compromis doivent être invalidés ;
8. les sessions existantes doivent pouvoir être révoquées de manière sélective ou globale ;
9. les opérations financières sensibles peuvent être temporairement restreintes après récupération ;
10. les utilisateurs doivent être informés des changements critiques via les canaux encore considérés fiables ;
11. les données biométriques brutes ne doivent pas être centralisées par Mansa lorsque la biométrie native de l’appareil suffit ;
12. la récupération doit fonctionner même pour les personnes n’ayant pas d’e-mail ;
13. les utilisateurs sans smartphone ou avec connectivité limitée doivent disposer de parcours adaptés ;
14. les parcours professionnels et administratifs doivent appliquer la séparation des tâches ;
15. aucun secret, OTP, PIN, token ou document sensible ne doit apparaître dans les logs applicatifs ;
16. les règles de récupération doivent être configurables par pays, produit, type de compte et niveau de risque ;
17. le système doit privilégier une récupération sûre plutôt qu’une récupération instantanée lorsque les signaux sont contradictoires ;
18. aucune procédure manuelle ne doit effacer l’historique de l’incident.

## 3. Périmètre des identités

La récupération doit couvrir au minimum les profils suivants :

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
MANSA_ADMIN
DEVELOPER_ACCOUNT
DEVICE_IDENTITY
```

Les exigences ne sont pas identiques pour tous les profils.

Un compte client grand public peut utiliser un parcours fortement automatisé.

Un compte administrateur, État ou opérateur financier doit imposer des contrôles supplémentaires et, selon le cas, une validation humaine séparée.

## 4. Concepts du domaine

Entités recommandées :

```text
RecoveryCase
RecoveryAttempt
RecoveryPolicy
RecoveryFactor
RecoveryEvidence
TrustedDevice
DeviceBinding
PhoneNumberBinding
SimRiskSignal
IdentityReverification
RecoveryDecision
RecoveryRestriction
SessionRevocation
CredentialRotation
SecurityNotification
RecoveryApproval
RecoveryAuditEvent
```

## 5. RecoveryCase

Un `RecoveryCase` représente une procédure complète de récupération.

Champs recommandés :

```text
id
userId
organizationId?
countryCode
product
reason
riskLevel
status
createdAt
expiresAt
completedAt?
failedAt?
lockedAt?
sourceChannel
initiatedBy
```

Raisons possibles :

```text
LOST_DEVICE
STOLEN_DEVICE
BROKEN_DEVICE
NEW_DEVICE
SIM_REPLACED
SIM_SWAP_SUSPECTED
PHONE_NUMBER_CHANGED
PIN_FORGOTTEN
SECOND_FACTOR_LOST
EMAIL_LOST
ACCOUNT_COMPROMISED
SECURITY_LOCK
ADMINISTRATIVE_RECOVERY
DEVICE_REPROVISIONING
OTHER
```

Statuts :

```text
CREATED
COLLECTING_EVIDENCE
PENDING_RISK_REVIEW
PENDING_HUMAN_REVIEW
PENDING_COOLDOWN
APPROVED
REJECTED
COMPLETED
EXPIRED
LOCKED
CANCELLED
```

## 6. Politique de récupération

Une `RecoveryPolicy` doit être résolue à partir de :

```text
country
product
accountType
organization
role
riskTier
kycLevel
requestedAction
```

La politique définit au minimum :

```text
requiredEvidence
minimumIndependentFactors
cooldownDuration
manualReviewThreshold
transactionRestrictionDuration
maxAttempts
caseLifetime
notificationChannels
requiredApprovals
```

Les politiques doivent être versionnées et auditées.

## 7. Niveaux de risque

Niveaux recommandés :

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Exemples de signaux augmentant le risque :

- nouvel appareil inconnu ;
- nouvelle SIM ;
- numéro récemment porté ;
- pays ou zone inhabituelle ;
- appareil rooté/jailbreaké lorsque ce signal est fiable ;
- nombreuses tentatives de récupération ;
- changement simultané de numéro et d’appareil ;
- compte avec solde ou limites élevés ;
- compte administrateur ou État ;
- récupération peu après changement KYC ;
- compte signalé pour fraude ;
- session active depuis un autre appareil pendant la récupération ;
- divergence entre les éléments d’identité fournis et les données vérifiées.

Un signal ne doit pas provoquer automatiquement une accusation de fraude. Il alimente une décision de risque.

## 8. Facteurs et preuves

Les catégories de preuve doivent être distinguées.

### 8.1 Possession

Exemples :

- appareil déjà lié ;
- clé/passkey déjà enregistrée ;
- numéro précédemment vérifié ;
- carte physique Mansa vérifiée via challenge autorisé ;
- canal partenaire fiable selon contrat.

### 8.2 Connaissance

Exemples :

- PIN ou secret existant lorsque son usage est autorisé ;
- informations de compte non publiques.

Les questions de sécurité statiques du type « nom de jeune fille » ne doivent pas être utilisées comme facteur principal.

### 8.3 Identité

Exemples :

- re-vérification d’un document déjà associé au KYC ;
- selfie/liveness via fournisseur autorisé ;
- contrôle en agence ou auprès d’un agent autorisé ;
- validation par une source d’identité publique/partenaire lorsque légalement et techniquement disponible.

### 8.4 Contexte comportemental

Exemples :

- appareil habituel ;
- localisation cohérente ;
- historique de connexion ;
- comportement connu ;
- ancienneté du compte.

Ces signaux complètent les preuves mais ne doivent pas devenir l’unique facteur d’identité.

## 9. Téléphone perdu ou volé

Le parcours doit proposer immédiatement :

```text
Signaler l’appareil perdu/volé
Révoquer la session de cet appareil
Bloquer les opérations sensibles depuis cet appareil
Démarrer la récupération sur un nouvel appareil
```

Lorsque l’utilisateur signale un vol :

1. l’ancien appareil passe en état `LOST` ou `STOLEN` ;
2. ses tokens de session sont révoqués ;
3. ses refresh tokens sont invalidés ;
4. les secrets locaux dérivés doivent devenir inutilisables après révocation serveur ;
5. les notifications push vers cet appareil ne doivent plus être considérées comme preuve ;
6. une alerte de sécurité est créée ;
7. le nouveau parcours exige une revalidation adaptée au risque.

## 10. Changement normal de téléphone

Si l’ancien téléphone est encore disponible, Mansa doit proposer un transfert sécurisé d’appareil.

Exemple :

```text
ancien appareil authentifié
-> demande d’ajout du nouveau
-> challenge court / QR de transfert
-> confirmation sur ancien appareil
-> création du nouveau DeviceBinding
-> rotation ou réémission des credentials
-> option de déconnexion de l’ancien appareil
```

Le QR de transfert doit :

- être à usage unique ;
- expirer rapidement ;
- ne contenir aucun secret réutilisable en clair ;
- être lié à la session et au nouveau device ;
- être invalidé après utilisation.

## 11. Changement d’appareil sans ancien appareil

Lorsque l’ancien appareil est indisponible, le système doit augmenter le niveau de preuve.

Parcours possible :

```text
identifiant / numéro
-> vérification du nouveau canal
-> signaux SIM et appareil
-> re-vérification d’identité selon niveau KYC
-> évaluation du risque
-> cooldown éventuel
-> création du nouvel appareil
-> révocation des anciens appareils selon politique
```

## 12. Risque SIM swap

La récupération par SMS doit considérer le risque de SIM swap.

Le système doit pouvoir ingérer, lorsque les partenaires le permettent :

```text
simChangeAge
numberPortingAge
subscriberChangeSignal
lineStatus
operatorRiskSignal
```

Si une SIM a été changée très récemment, un OTP SMS ne doit pas suffire pour une récupération à risque élevé.

Le seuil exact doit être configurable et ne doit pas être codé en dur globalement.

## 13. OTP

Les OTP de récupération doivent :

- avoir une durée de vie courte ;
- être à usage unique ;
- être limités en nombre d’essais ;
- être protégés contre le brute force ;
- être liés au contexte de récupération ;
- ne jamais être stockés en clair ;
- ne jamais apparaître dans les logs ;
- être invalidés lorsqu’un nouvel OTP remplace l’ancien.

Le renvoi d’OTP doit être limité par utilisateur, numéro, appareil, IP et risque.

## 14. PIN oublié

Le PIN ne doit pas être récupérable en clair.

Le parcours est une réinitialisation :

```text
recovery verified
-> authorization to reset
-> new PIN entry
-> confirmation
-> invalidate old PIN verifier
-> credential rotation where needed
-> audit event
```

Mansa ne doit jamais afficher, envoyer ou révéler l’ancien PIN.

## 15. Passkeys et biométrie

Lorsque les passkeys sont utilisées :

- elles doivent être enregistrées comme credentials séparés ;
- la perte d’une passkey ne supprime pas automatiquement les autres ;
- une récupération peut autoriser l’enregistrement d’une nouvelle passkey seulement après décision positive ;
- les anciennes passkeys compromises peuvent être révoquées.

La biométrie Face ID/Touch ID/Android Biometrics reste gérée par le système de l’appareil.

Mansa stocke l’état d’enrôlement et les clés nécessaires au protocole, pas l’empreinte biométrique brute.

## 16. Numéro de téléphone changé

Le changement de numéro est différent d’une simple récupération.

Il doit distinguer :

```text
oldNumberAvailable = true/false
newNumberVerified = true/false
simRisk
accountRisk
```

Si l’ancien numéro est encore accessible, confirmer sur ancien + nouveau canal réduit le risque.

Si l’ancien numéro est perdu, utiliser une re-vérification renforcée.

L’ancien numéro doit être retiré des usages d’authentification après délai et décision finale.

## 17. Recyclage des numéros

Mansa doit considérer qu’un numéro téléphonique peut être réattribué par un opérateur.

La simple possession d’un ancien numéro associé au compte ne doit donc jamais permettre de reprendre un compte dormant de grande valeur sans preuves supplémentaires.

Une longue période d’inactivité, suivie d’un nouvel appareil et d’un OTP sur le même numéro, doit déclencher une politique renforcée.

## 18. E-mail

L’e-mail peut être utilisé comme canal secondaire lorsque vérifié, mais il ne doit pas être obligatoire pour les utilisateurs grand public au Mali.

Un changement d’e-mail doit produire :

- confirmation du nouveau canal ;
- notification de l’ancien canal si disponible ;
- audit ;
- délai de sécurité selon risque.

## 19. KYC et re-vérification

La récupération ne doit pas refaire inutilement tout le KYC.

Elle doit utiliser un niveau de re-vérification proportionné.

Exemples :

```text
LEVEL_0 = aucun document supplémentaire
LEVEL_1 = cohérence des données + facteur existant
LEVEL_2 = document déjà connu + liveness
LEVEL_3 = revue humaine / source renforcée
```

Les documents collectés pour récupération suivent les politiques de conservation du domaine privacy.

## 20. Liveness et selfie

Lorsqu’un selfie/liveness est requis :

- le fournisseur doit être configuré derrière une interface ;
- le score brut n’est jamais l’unique décision ;
- les faux rejets doivent avoir une procédure d’escalade ;
- la qualité du réseau et de la caméra doit être prise en compte ;
- un parcours alternatif doit exister lorsqu’une personne ne peut pas utiliser la biométrie faciale.

## 21. RecoveryDecision

Une décision doit produire :

```text
decision
riskScore
riskLevel
policyVersion
requiredRestrictions
reasonCodes
reviewerId?
decidedAt
```

Décisions :

```text
APPROVE
APPROVE_WITH_COOLDOWN
APPROVE_WITH_RESTRICTIONS
REVIEW
REJECT
LOCK
```

Les reason codes internes doivent être stables et localisables côté interface.

## 22. Cooldown

Pour les récupérations sensibles, Mansa peut appliquer un délai de sécurité configurable.

Pendant le cooldown :

- connexion limitée possible selon politique ;
- consultation du solde éventuellement autorisée ;
- transferts, retraits, ajout de bénéficiaire, changement de limites ou nouvelle carte peuvent être bloqués ;
- l’utilisateur est informé clairement de la durée et de la raison générale ;
- une alerte de sécurité est envoyée aux anciens canaux fiables lorsqu’ils existent.

Le cooldown ne doit pas être contournable par un agent de support ordinaire.

## 23. Restrictions post-récupération

Restrictions configurables :

```text
BLOCK_CASH_WITHDRAWAL
BLOCK_P2P_TRANSFER
BLOCK_BANK_TRANSFER
BLOCK_NEW_BENEFICIARY
BLOCK_CARD_ISSUANCE
BLOCK_LIMIT_INCREASE
BLOCK_PHONE_CHANGE
BLOCK_KYC_CHANGE
BLOCK_DEVICE_ADD
REQUIRE_STEP_UP
```

Elles doivent avoir :

```text
startedAt
expiresAt
reason
policyVersion
liftedBy?
```

## 24. Session management

Une récupération réussie doit déterminer explicitement quoi faire des sessions :

```text
KEEP_TRUSTED_SESSIONS
REVOKE_LOST_DEVICE
REVOKE_ALL_OTHER_SESSIONS
REVOKE_ALL_SESSIONS
```

Pour une compromission présumée, la politique recommandée est la révocation large avec nouvelle authentification.

## 25. TrustedDevice

Un appareil de confiance doit être une relation serveur, pas un simple booléen local.

Champs :

```text
id
userId
deviceId
platform
publicKey?
firstSeenAt
lastSeenAt
trustLevel
status
attestationState?
recoveryEligible
```

Statuts :

```text
ACTIVE
UNTRUSTED
LOST
STOLEN
REVOKED
RETIRED
```

## 26. Empreinte appareil

Le fingerprinting doit respecter la vie privée et ne pas dépendre d’identifiants instables ou interdits par la plateforme.

Les signaux d’appareil sont des indicateurs de risque, pas une preuve absolue d’identité.

## 27. Support humain

Le support peut assister mais ne doit pas contourner la politique.

L’interface support doit afficher :

- identité du demandeur ;
- risque du dossier ;
- preuves déjà vérifiées ;
- actions autorisées au rôle courant ;
- étapes restant à accomplir ;
- avertissements de fraude ;
- historique du dossier.

Le support ne doit jamais voir un PIN, mot de passe, OTP ou secret complet.

## 28. Séparation des tâches

Pour les comptes sensibles :

```text
requester != approver
```

Exemples nécessitant potentiellement une double validation :

- Super Admin Mansa ;
- administrateur État ;
- administrateur d’une grande entreprise ;
- réactivation d’un terminal de paiement sensible ;
- récupération avec signaux de fraude élevés ;
- suppression d’un blocage de sécurité critique.

## 29. Récupération commerçant

Pour un propriétaire de commerce :

- distinguer compte personnel et droits sur l’organisation ;
- restaurer l’identité utilisateur avant les permissions organisationnelles ;
- ne pas transférer automatiquement la propriété du commerce à un nouveau numéro ;
- notifier les autres administrateurs du commerce lorsque pertinent ;
- permettre la révocation des terminaux liés en cas de vol.

## 30. Employés commerçant

Un employé peut être désactivé/réinvité par un administrateur autorisé du commerce sans modifier l’identité du propriétaire.

La réinvitation crée un nouveau cycle d’accès et doit révoquer les anciennes sessions selon politique.

## 31. Réseau agents

La récupération d’un compte agent doit prendre en compte :

- float et exposition financière ;
- terminal ou téléphone lié ;
- localisation habituelle ;
- superviseur associé ;
- statut KYC/KYB ;
- incidents récents.

Un agent récupéré ne doit pas pouvoir immédiatement effectuer des opérations au plafond maximal si le dossier est à risque élevé.

## 32. Comptes État

Les comptes État doivent appliquer des politiques renforcées.

Exigences :

- rôles et organisation toujours conservés côté serveur ;
- récupération d’identité distincte de la réattribution des permissions ;
- double approbation configurable ;
- journal d’audit non modifiable par l’agent récupéré ;
- notification du responsable hiérarchique ;
- révocation immédiate du terminal perdu ;
- nouvelle association de terminal auditée.

Une récupération ne doit jamais effacer les événements administratifs ou financiers antérieurs.

## 33. Terminaux TPE

Un TPE perdu ou volé doit pouvoir être :

```text
SUSPENDED
REVOKED
QUARANTINED
```

Le reprovisionnement sur un nouveau terminal exige :

- identité du commerce/agent ;
- droit de provisionner ;
- nouveau DeviceIdentity ;
- nouvelles clés ;
- ancienne identité révoquée ;
- audit.

Aucune clé du terminal perdu ne doit être réutilisée.

## 34. Admin Lite et portails web

Les comptes privilégiés doivent préférer des facteurs résistants au phishing lorsque disponibles : passkeys, clés de sécurité ou dispositifs équivalents.

Une récupération par simple SMS pour un Super Admin doit être interdite.

## 35. Comptes développeur

La récupération d’un compte développeur ne doit pas restaurer automatiquement les secrets API existants.

En cas de compromission :

- révoquer les sessions ;
- proposer rotation des clés API ;
- invalider les tokens personnels ;
- notifier les membres de l’organisation ;
- conserver l’audit.

## 36. Cartes physiques et virtuelles

Une récupération de compte ne doit pas automatiquement remplacer ou réactiver toutes les cartes.

Selon risque :

```text
KEEP_CARD_STATE
TEMPORARILY_FREEZE
REQUIRE_CARD_CONFIRMATION
REISSUE_VIRTUAL_CARD_CREDENTIALS
```

Les règles carte restent gouvernées par le domaine cards et le partenaire émetteur.

## 37. Wallet et ledger

La récupération ne modifie jamais directement :

- les écritures du ledger ;
- le solde comptable ;
- l’historique financier.

Elle modifie uniquement l’autorisation d’accès et les restrictions.

Aucune procédure de récupération ne doit « recréer » un solde dans un nouveau compte.

## 38. Éviter la création de doublons

Si un utilisateur tente de récupérer un compte existant mais démarre par erreur une nouvelle inscription, le système doit détecter les conflits d’identité selon les règles KYC et proposer un parcours contrôlé.

La fusion automatique de comptes financiers est interdite.

## 39. Utilisateur sans smartphone

Mansa doit prévoir des parcours adaptés :

- assistance en agence/agent autorisé ;
- terminal partagé sécurisé ;
- vérification documentaire ;
- OTP opérateur lorsque autorisé ;
- procédure manuelle à double contrôle pour cas sensibles.

Le manque de smartphone ne doit pas conduire à une procédure de sécurité universellement plus faible.

## 40. Faible connectivité

Le processus doit tolérer :

- délais réseau ;
- reprise d’un dossier interrompu ;
- téléchargement différé des preuves ;
- OTP avec fenêtre raisonnable configurable ;
- statut clair de soumission.

Toute décision finale nécessitant le serveur doit rester serveur-side.

Une récupération financière complète ne doit pas être décidée uniquement hors ligne sur un appareil non fiable.

## 41. Centre d’appel et Jini Voice

Jini Voice peut guider l’utilisateur mais ne doit pas révéler d’informations sensibles avant authentification adaptée.

L’IA ne doit jamais :

- demander un PIN complet ;
- demander un mot de passe ;
- demander de lire un OTP destiné à une autre opération ;
- décider seule d’une récupération critique ;
- contourner les règles du moteur de risque.

Elle peut :

- identifier le motif ;
- expliquer les étapes ;
- ouvrir un dossier ;
- transférer vers un humain ;
- donner le statut générique du dossier.

## 42. Notifications de sécurité

Événements devant pouvoir déclencher une notification :

```text
RECOVERY_STARTED
NEW_DEVICE_REQUESTED
PHONE_CHANGE_REQUESTED
SIM_RISK_DETECTED
RECOVERY_APPROVED
RECOVERY_REJECTED
RECOVERY_COMPLETED
ALL_SESSIONS_REVOKED
NEW_PASSKEY_ADDED
PHONE_NUMBER_CHANGED
SECURITY_RESTRICTION_APPLIED
```

Les notifications ne doivent pas révéler de données sensibles sur écran verrouillé.

## 43. Canal de notification

Ordre possible selon disponibilité :

- push vers appareil encore fiable ;
- SMS vers ancien numéro lorsque toujours fiable ;
- e-mail vérifié ;
- centre de notifications Mansa ;
- canal organisationnel pour administrateurs.

La réussite d’une récupération ne doit pas dépendre d’un canal déjà déclaré compromis.

## 44. Anti-phishing

Les messages de récupération doivent rappeler que Mansa ne demande jamais :

- le PIN complet ;
- le mot de passe complet ;
- un OTP par appel entrant non initié ;
- une clé privée ;
- un code de secours destiné à une autre opération.

Les liens de récupération doivent être courts en durée, signés et liés au contexte.

## 45. Rate limiting

Appliquer des limites au minimum par :

```text
account
phoneNumber
email
IP
ASN
country
device
recoveryCase
```

Le système doit distinguer les erreurs utilisateur des campagnes automatisées.

## 46. Énumération de comptes

Les écrans publics ne doivent pas permettre de confirmer facilement qu’un numéro ou e-mail possède un compte.

Messages recommandés :

```text
Si un compte correspondant existe, les prochaines étapes seront proposées de manière sécurisée.
```

L’UX peut être adaptée si l’utilisateur est déjà dans un contexte authentifié.

## 47. Brute force et verrouillage

Les échecs répétés peuvent :

- ralentir les tentatives ;
- exiger un facteur supplémentaire ;
- imposer une revue humaine ;
- verrouiller temporairement le dossier ;
- déclencher une alerte fraude.

Un verrouillage ne doit pas devenir un moyen facile de déni de service contre une victime.

## 48. Audit

Chaque événement doit enregistrer :

```text
eventId
recoveryCaseId
actorType
actorId?
action
result
reasonCodes
riskLevel
policyVersion
deviceId?
sourceIpMetadata?
timestamp
correlationId
```

Les données sensibles sont minimisées ou hachées selon besoin.

## 49. Événements immuables recommandés

```text
RECOVERY_CASE_CREATED
EVIDENCE_SUBMITTED
EVIDENCE_VERIFIED
EVIDENCE_REJECTED
RISK_EVALUATED
MANUAL_REVIEW_REQUESTED
APPROVAL_GRANTED
APPROVAL_REJECTED
COOLDOWN_STARTED
CREDENTIAL_ROTATED
DEVICE_REVOKED
SESSION_REVOKED
RESTRICTION_APPLIED
RECOVERY_COMPLETED
RECOVERY_FAILED
```

## 50. Journal support

Les commentaires humains doivent être séparés des reason codes machine.

Ils peuvent être corrigés par ajout d’un nouvel événement mais ne doivent pas supprimer l’historique original.

## 51. Protection des preuves

Les documents et captures collectés :

- sont chiffrés au repos ;
- ont des ACL strictes ;
- utilisent des URLs temporaires ;
- ne sont pas placés dans les logs ;
- suivent une durée de conservation définie ;
- sont supprimés lorsque la politique privacy l’exige.

## 52. Cryptographie

Les tokens de récupération doivent utiliser des secrets/clefs gérés par le système de gestion cryptographique Mansa.

Interdictions :

- token prédictible ;
- secret hardcodé ;
- token réutilisable ;
- token sans expiration ;
- secret de production dans Git.

## 53. APIs

Endpoints indicatifs :

```text
POST /v1/recovery/cases
GET  /v1/recovery/cases/:id
POST /v1/recovery/cases/:id/evidence
POST /v1/recovery/cases/:id/verify-otp
POST /v1/recovery/cases/:id/complete
POST /v1/recovery/cases/:id/cancel
POST /v1/security/devices/:id/report-lost
POST /v1/security/sessions/revoke
POST /v1/security/credentials/rotate
```

Les noms réels peuvent être adaptés à l’architecture API existante.

## 54. Idempotence

Les opérations critiques doivent être idempotentes :

- finalisation d’une récupération ;
- révocation d’un device ;
- rotation d’un credential ;
- changement de numéro ;
- application de restriction.

Une reprise réseau ne doit pas créer plusieurs nouveaux appareils ou rotations incohérentes.

## 55. Concurrence

Deux dossiers de récupération concurrents pour le même compte doivent être arbitrés.

Politique recommandée :

- un dossier critique actif peut bloquer les nouveaux dossiers ;
- la finalisation invalide les autres dossiers plus anciens ;
- les décisions utilisent verrouillage transactionnel/version optimiste ;
- aucun double changement de numéro n’est possible.

## 56. Modèle multi-pays

Les règles doivent varier sans fork du code :

```text
RecoveryPolicy(country=ML)
RecoveryPolicy(country=CI)
RecoveryPolicy(country=SN)
```

Les différences peuvent porter sur :

- fournisseurs d’identité ;
- opérateurs télécoms ;
- documents acceptés ;
- délais ;
- obligations réglementaires ;
- langues ;
- canaux d’assistance.

## 57. Multi-tenant

Toute requête d’administration ou de support organisationnel doit être scoped au tenant.

Un administrateur d’une entreprise A ne peut pas récupérer ou modifier un utilisateur de l’entreprise B.

Les rôles Mansa globaux utilisent des permissions explicites et auditables.

## 58. RBAC

Permissions recommandées :

```text
recovery.case.read
recovery.case.create
recovery.case.review
recovery.case.approve
recovery.restriction.apply
recovery.restriction.lift
device.revoke
session.revoke
credential.rotate
phone.change.approve
```

Aucun rôle ne reçoit toutes les permissions par défaut.

## 59. Double contrôle

La plateforme doit permettre :

```text
maker-checker
four-eyes approval
threshold-based approval
```

Les seuils sont configurables selon type de compte et risque.

## 60. Métriques

Métriques opérationnelles :

```text
recovery_started_total
recovery_completed_total
recovery_rejected_total
recovery_manual_review_total
recovery_duration_seconds
recovery_otp_failure_total
recovery_sim_risk_total
recovery_post_fraud_total
recovery_support_escalation_total
```

Les métriques ne doivent pas exposer de PII.

## 61. KPIs produit

Suivre :

- taux de récupération réussie ;
- temps médian ;
- taux d’abandon ;
- faux rejets ;
- fraude post-récupération ;
- part nécessitant support ;
- répartition par motif ;
- répartition par canal ;
- incidents SIM swap.

La réduction du temps de récupération ne doit jamais être optimisée au détriment de la fraude.

## 62. Alertes

Alertes possibles :

- hausse anormale des récupérations ;
- pic depuis une ASN/IP ;
- taux élevé d’échecs OTP ;
- multiples comptes vers un même appareil ;
- récupération suivie de retraits/transferts inhabituels ;
- abus d’un agent support ;
- dépassement des délais de revue.

## 63. Tests unitaires

Tester au minimum :

- expiration ;
- OTP invalide ;
- nombre maximal d’essais ;
- SIM récente ;
- trusted device ;
- révocation de session ;
- cooldown ;
- restriction ;
- RBAC ;
- multi-tenant ;
- concurrence ;
- idempotence.

## 64. Tests négatifs de sécurité

Scénarios obligatoires :

1. attaquant possède seulement la nouvelle SIM ;
2. attaquant connaît le numéro mais pas l’identité ;
3. utilisateur d’un tenant tente de récupérer un compte d’un autre tenant ;
4. support tente d’approuver sans permission ;
5. même OTP utilisé deux fois ;
6. token expiré ;
7. ancien appareil réutilise un refresh token après révocation ;
8. deux changements de numéro concurrents ;
9. récupération puis tentative immédiate d’augmentation de limite ;
10. admin tente de supprimer l’audit.

## 65. Tests E2E

Parcours :

```text
nouvel appareil + ancien disponible
nouvel appareil + ancien perdu
SIM changée récemment
numéro changé
PIN oublié
compte compromis
agent support + double approbation
TPE volé + reprovisionnement
admin État récupéré
```

## 66. Critères d’acceptation MVP

Le MVP ne peut être déclaré prêt que si :

- téléphone perdu peut être révoqué ;
- nouveau device peut être lié avec vérification ;
- OTP est sécurisé et limité ;
- PIN peut être réinitialisé sans être révélé ;
- SIM swap récent augmente le risque lorsqu’un signal est disponible ;
- sessions peuvent être révoquées ;
- récupération produit un audit complet ;
- restrictions post-récupération existent ;
- support ne peut pas contourner les permissions ;
- multi-tenant est testé négativement ;
- aucun secret n’est stocké en clair ou dans Git.

## 67. Phasage

### Phase 1

- RecoveryCase ;
- nouvel appareil ;
- perte appareil ;
- OTP ;
- PIN reset ;
- session/device revocation ;
- audit ;
- cooldown ;
- restrictions de base.

### Phase 2

- signaux télécom SIM swap ;
- re-vérification KYC avancée ;
- support maker-checker ;
- passkeys ;
- récupération commerçant/agent approfondie.

### Phase 3

- intégrations nationales d’identité selon pays ;
- orchestration avancée du risque ;
- automatisation adaptative ;
- analytics fraude post-récupération.

## 68. Dépendances

Le module dépend de :

```text
identity/authentication
security/RBAC
risk-engine
KYC/KYB
notifications
devices/provisioning
privacy/data-retention
cryptographic-key-management
audit/observability
support
```

Il ne doit pas dupliquer leurs responsabilités.

## 69. Règles d’intégration avec le moteur de risque

Le module fournit des événements et reçoit une décision/stratégie.

Il ne doit pas coder en dur toutes les règles fraude dans les contrôleurs HTTP.

Exemple :

```text
RecoveryContext
-> RiskEngine.evaluate()
-> RecoveryDecision
-> PolicyEngine.resolve()
-> required steps
```

## 70. Expérience utilisateur

L’interface doit :

- expliquer pourquoi une vérification supplémentaire est demandée ;
- éviter le jargon « SIM swap » si l’utilisateur n’en a pas besoin ;
- afficher la progression ;
- permettre de reprendre un dossier ;
- préciser les délais lorsqu’une revue humaine est nécessaire ;
- proposer une voie d’assistance ;
- être localisable FR/BM/EN et autres langues activées.

## 71. Accessibilité

Les parcours doivent respecter :

- gros textes et zoom ;
- lecteur d’écran ;
- navigation clavier sur web ;
- contrastes ;
- alternatives à la biométrie ;
- messages d’erreur compréhensibles.

## 72. Données à ne jamais demander

Le support ou l’IA ne doit jamais demander :

```text
PIN complet existant
mot de passe complet
clé privée
CVV complet enregistré
secret API
seed phrase
OTP d’une transaction sans rapport avec la récupération
```

## 73. Cas de décès ou incapacité

La récupération classique ne doit pas servir de mécanisme de succession.

Les cas légaux de décès/incapacité doivent être traités par un processus distinct, avec justificatifs, conformité et règles du partenaire financier.

## 74. Mineurs et comptes sous responsabilité

Si Mansa propose des comptes mineurs ou sous tutelle :

- la politique de récupération doit connaître le représentant autorisé ;
- le représentant ne reçoit pas automatiquement des droits supérieurs à ceux prévus ;
- l’âge de majorité déclenche un parcours séparé si nécessaire.

## 75. Comptes dormants

Un compte dormant depuis longtemps doit utiliser une récupération renforcée avant toute sortie de fonds importante.

La possession du numéro historique seule est insuffisante.

## 76. Incident de masse

En cas de fuite ou compromission affectant de nombreux comptes, Mansa doit pouvoir :

- invalider un type de credential ;
- forcer une rotation ;
- appliquer des restrictions temporaires ;
- envoyer une communication ciblée ;
- ouvrir un incident SRE/sécurité ;
- préserver les preuves.

## 77. Rollback

Les changements de configuration peuvent être rollbackés, mais une ancienne clé compromise ou un ancien token révoqué ne doit pas être réactivé par rollback.

La sécurité des credentials est monotone après compromission : une révocation reste effective.

## 78. Exigences de journalisation

Les logs applicatifs utilisent des identifiants techniques et reason codes.

Interdits dans les logs :

- document complet ;
- selfie brut ;
- OTP ;
- PIN ;
- token ;
- numéro complet lorsque non nécessaire ;
- adresse e-mail complète lorsque non nécessaire.

## 79. Gouvernance

Toute modification d’une RecoveryPolicy sensible doit enregistrer :

```text
oldVersion
newVersion
changedBy
approvedBy?
reason
createdAt
effectiveAt
```

Les changements critiques peuvent exiger approbation séparée.

## 80. Résultat attendu

À terme, Mansa doit disposer d’un moteur de récupération commun à tous les produits capable de restaurer l’accès d’un utilisateur légitime sans transformer le support, le SMS ou le changement de téléphone en porte dérobée.

Le système doit combiner identité, possession, risque, appareils, sessions, politiques, audit et restrictions post-récupération.

La récupération doit être suffisamment simple pour un utilisateur normal, suffisamment robuste pour une fintech et suffisamment gouvernée pour les usages entreprises et État.