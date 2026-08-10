# Cahier des charges — Gouvernance, conservation, suppression et export des données

## 1. Objet

Ce document définit les règles transverses de gouvernance des données pour l’ensemble de l’écosystème Mansa.

Il couvre la classification, la minimisation, la conservation, l’archivage, la suppression, l’anonymisation, la pseudonymisation, l’export, la portabilité, la traçabilité, la localisation, l’accès administratif et la preuve de traitement des données.

Il s’applique notamment aux applications client, commerçant, TPE, Admin Lite, portails web, services backend, wallets, ledger, paiements, cartes, KYC/KYB, agents, secteur public, péages, transport, Jini Voice, notifications, fraude, support, analytics, reporting, observabilité, intégrations bancaires, Mobile Money et partenaires.

L’objectif est de permettre à Mansa de conserver uniquement les données nécessaires, pendant la durée nécessaire, avec une règle explicite et auditable pour chaque catégorie de données.

## 2. Principes directeurs

1. La donnée n’est jamais conservée sans finalité explicite.
2. La durée de conservation dépend de la nature de la donnée, de la finalité, du pays, du contrat et des obligations réglementaires applicables.
3. Aucune durée réglementaire universelle ne doit être codée en dur pour tous les pays.
4. Les données à forte sensibilité doivent être séparées des données opérationnelles courantes.
5. Les données financières, d’audit et de conformité peuvent nécessiter une conservation plus longue que les données d’usage ou de session.
6. Une suppression utilisateur ne doit jamais supprimer une preuve légalement requise.
7. Une donnée pouvant être anonymisée doit l’être lorsque la finalité ne nécessite plus l’identité.
8. Les données vocales, biométriques, documents KYC bruts et contenus de communication doivent avoir des durées courtes par défaut.
9. Les secrets, PIN, CVV, mots de passe et clés privées ne font pas partie d’une politique de conservation : ils ne doivent pas être stockés en clair.
10. Toute règle de rétention doit être versionnée, datée et attribuable.
11. Toute opération de purge massive doit être auditable.
12. Les données d’un tenant ne doivent jamais être exportées ou supprimées par un autre tenant.
13. Les utilisateurs doivent pouvoir exporter leurs données lorsqu’un droit ou une fonction produit le permet.
14. La suppression doit inclure les copies secondaires lorsque cela est techniquement et légalement applicable.
15. Les sauvegardes ne doivent pas devenir un moyen de contourner une suppression définitive.

## 3. Périmètre fonctionnel

Le domaine couvre :

- registre des catégories de données ;
- classification par sensibilité ;
- finalité de traitement ;
- base contractuelle ou réglementaire ;
- règles de conservation ;
- legal hold ;
- archivage ;
- suppression logique ;
- suppression physique ;
- anonymisation ;
- pseudonymisation ;
- export individuel ;
- export entreprise/tenant ;
- export avant suppression ;
- gestion des données vocales ;
- gestion des pièces KYC/KYB ;
- gestion des logs ;
- gestion des sauvegardes ;
- résidence et localisation ;
- journalisation des opérations ;
- preuves de purge ;
- contrôles d’accès ;
- reporting de conformité.

## 4. Non-objectifs

Ce domaine ne remplace pas :

- le moteur d’autorisation/RBAC ;
- le système KYC/KYB ;
- le ledger ;
- le SIEM ;
- la politique de chiffrement ;
- les contrats partenaires ;
- les exigences légales propres à chaque juridiction.

Il fournit le cadre technique permettant de les appliquer de manière cohérente.

## 5. Registre des catégories de données

Chaque catégorie doit être enregistrée avec au minimum :

```text
DataCategory
id
code
name
ownerDomain
sensitivity
containsPersonalData
containsFinancialData
containsGovernmentData
containsBiometricData
containsVoiceData
containsAuthenticationData
purpose
retentionPolicyId
defaultCountryScope
isExportable
isAnonymizable
isDeletable
createdAt
updatedAt
```

Exemples :

```text
IDENTITY_PROFILE
KYC_DOCUMENT
MERCHANT_KYB_DOCUMENT
PAYMENT_TRANSACTION
LEDGER_ENTRY
CARD_TOKEN_REFERENCE
SUPPORT_MESSAGE
VOICE_RECORDING
VOICE_TRANSCRIPT
NOTIFICATION_CONTENT
DEVICE_LOG
AUDIT_EVENT
TOLL_PASSAGE
ANPR_PLATE_EVENT
LOGIN_SESSION
FRAUD_SIGNAL
ANALYTICS_EVENT
```

## 6. Classification de sensibilité

Classification recommandée :

```text
PUBLIC
INTERNAL
CONFIDENTIAL
SENSITIVE
HIGHLY_SENSITIVE
REGULATED
```

Exemples :

- documentation publique : `PUBLIC` ;
- métriques agrégées internes : `INTERNAL` ;
- email utilisateur : `CONFIDENTIAL` ;
- données KYC : `SENSITIVE` ;
- document d’identité brut : `HIGHLY_SENSITIVE` ;
- données réglementées de paiement : `REGULATED`.

La classification doit influencer :

- chiffrement ;
- accès ;
- export ;
- durée ;
- masquage ;
- journalisation ;
- localisation ;
- environnement de traitement.

## 7. Politique de conservation

Modèle recommandé :

```text
RetentionPolicy
id
code
name
dataCategoryCode
countryCode
legalBasis
contractBasis
retentionDuration
retentionUnit
startsFrom
archiveAfter
archiveUnit
deleteMode
anonymizeInsteadOfDelete
legalHoldAllowed
policyVersion
effectiveFrom
effectiveTo
approvedBy
createdAt
updatedAt
```

`startsFrom` peut être :

```text
CREATED_AT
LAST_ACTIVITY_AT
ACCOUNT_CLOSED_AT
CONTRACT_ENDED_AT
TRANSACTION_COMPLETED_AT
KYC_EXPIRED_AT
CASE_CLOSED_AT
INCIDENT_RESOLVED_AT
```

## 8. Durées configurables

Les durées doivent être configurables par :

```text
GLOBAL
COUNTRY
TENANT
PRODUCT
DATA_CATEGORY
REGULATORY_PROFILE
```

La règle la plus spécifique applicable doit prévaloir, sous réserve d’un minimum réglementaire supérieur.

Mansa ne doit pas imposer une durée universelle lorsque la législation ou le contrat varie selon le pays.

## 9. Données financières

Les catégories suivantes ne doivent jamais être supprimées uniquement parce qu’un utilisateur ferme son compte :

- transactions ;
- écritures ledger ;
- règlements ;
- remboursements ;
- chargebacks ;
- rapprochements ;
- factures ;
- pièces comptables ;
- événements d’audit nécessaires à la preuve financière.

Elles peuvent être :

- conservées ;
- archivées ;
- pseudonymisées lorsque possible ;
- rendues inaccessibles aux interfaces utilisateur ordinaires.

## 10. Données d’authentification

Les données d’authentification doivent respecter des règles strictes :

- mot de passe : hash sécurisé uniquement ;
- refresh token : hash ou référence révoquable ;
- OTP : durée très courte ;
- session : expiration explicite ;
- jeton de récupération : durée très courte ;
- historique de sécurité : durée distincte et justifiée.

Aucun token actif ne doit être conservé au-delà de sa durée utile.

## 11. Documents KYC/KYB

Les pièces KYC/KYB doivent être stockées séparément des profils applicatifs courants.

Exigences :

- accès restreint ;
- chiffrement au repos ;
- URL signée à durée courte ;
- pas de lien public permanent ;
- pas de duplication dans les logs ;
- versionnement des vérifications ;
- conservation adaptée au pays et au partenaire réglementé ;
- purge contrôlée lorsque l’obligation expire.

Les métadonnées de preuve peuvent être conservées plus longtemps que le fichier brut.

## 12. Jini Voice — conservation limitée

Par défaut, Jini Voice doit minimiser la conservation des communications.

Catégories distinctes :

```text
CALL_METADATA
AUDIO_RECORDING
TRANSCRIPT
SUMMARY
INTENT
EXTRACTED_BUSINESS_DATA
AUDIT_EVENT
```

Les durées doivent être indépendantes.

Exemple : une organisation peut désactiver totalement l’enregistrement audio tout en conservant un résumé métier et une trace d’appel.

Les messages, transcriptions et enregistrements ne doivent pas être conservés indéfiniment par défaut.

## 13. Export avant suppression Jini Voice

Avant suppression automatique, une organisation doit pouvoir exporter les données autorisées vers son propre stockage lorsque cette fonctionnalité est activée.

Destinations possibles :

- téléchargement manuel ;
- stockage objet du client ;
- API du client ;
- système documentaire ;
- CRM ;
- stockage local contrôlé.

Après confirmation de l’export et expiration de la période de grâce, la copie Mansa doit être supprimée conformément à la politique applicable.

## 14. Contenu support et messagerie

Les messages de support doivent être séparés des données financières permanentes.

Ils peuvent contenir :

- texte ;
- pièces jointes ;
- captures ;
- audio ;
- historique conversationnel.

Leur durée doit être définie indépendamment.

Les pièces contenant des données sensibles doivent pouvoir avoir une durée plus courte que le ticket lui-même.

## 15. Notifications

Les notifications envoyées ne doivent pas nécessairement être conservées intégralement.

Il peut suffire de conserver :

```text
notificationId
channel
templateId
recipientReference
status
providerReference
sentAt
deliveredAt
failureCode
```

Le contenu exact peut être supprimé plus tôt lorsqu’il n’est plus nécessaire.

## 16. Données analytics

Les données analytics doivent privilégier :

- agrégation ;
- pseudonymisation ;
- identifiants techniques ;
- suppression des champs inutiles ;
- séparation entre analytics produit et source comptable.

Une métrique agrégée non personnelle peut être conservée plus longtemps qu’un événement utilisateur identifiable.

## 17. Logs techniques

Les logs ont leur propre politique de conservation.

Ils doivent être :

- structurés ;
- masqués ;
- limités ;
- purgés automatiquement ;
- archivés uniquement lorsque nécessaire.

Les logs ne doivent jamais devenir un entrepôt de documents KYC, audio, PAN complet, OTP, token ou secret.

## 18. Audit logs

Les journaux d’audit sont distincts des logs techniques.

Ils doivent documenter :

```text
actorId
actorType
action
resourceType
resourceId
tenantId
countryCode
beforeHash
afterHash
reason
ipOrDeviceReference
timestamp
```

Le contenu sensible doit être représenté par référence ou empreinte lorsque possible.

## 19. Péages et domaine État

Les données péage peuvent inclure :

```text
TOLL_TRANSACTION
VEHICLE_PASSAGE
RFID_EVENT
ANPR_EVENT
BARRIER_OPENING_EVENT
CASH_SESSION
CASH_RECONCILIATION
```

Les exigences de référence sont conservées :

- péage automatique classique avec barrière ;
- télépéage RFID UHF avec barrière ;
- free-flow futur optionnel sans remplacement obligatoire ;
- multi-fournisseurs ;
- fonctionnement hors ligne ;
- audit des ouvertures manuelles ;
- rapprochement véhicule, catégorie, tarif, paiement, ouverture et passage physique.

Les images ANPR doivent avoir une politique de conservation distincte des transactions de péage.

## 20. Plaques ANPR

Les plaques et images de véhicules doivent être minimisées.

Le système doit pouvoir conserver séparément :

- numéro de plaque normalisé ;
- hash de plaque ;
- score de confiance ;
- image brute ;
- crop de plaque ;
- horodatage ;
- voie ;
- justification métier.

L’image brute peut avoir une durée plus courte que l’événement de passage.

## 21. Mobile Money et partenaires

Les payloads partenaires ne doivent pas être conservés intégralement par défaut.

Conserver plutôt :

```text
provider
providerTransactionId
status
amount
currency
reference
receivedAt
processedAt
responseCode
```

Les secrets de signature, headers sensibles et tokens d’API doivent être exclus.

## 22. Carte bancaire

Mansa doit minimiser les données carte.

Ne jamais conserver :

- CVV/CVC ;
- PIN ;
- piste magnétique brute ;
- cryptogrammes sensibles non requis.

Lorsque possible, conserver uniquement :

- token fournisseur ;
- réseau ;
- last4 ;
- expiration masquée si nécessaire ;
- référence acquéreur.

## 23. Données hors ligne

Les applications et terminaux hors ligne peuvent conserver temporairement des données nécessaires à la continuité.

Exigences :

- chiffrement local ;
- durée maximale locale ;
- compteur d’ancienneté ;
- suppression après synchronisation ;
- absence de double débit ;
- file idempotente ;
- audit de synchronisation.

Les données hors ligne ne doivent pas rester indéfiniment sur un terminal perdu ou inactif.

## 24. Suppression logique

La suppression logique peut être utilisée pour :

- empêcher l’affichage immédiat ;
- préserver une période de récupération ;
- permettre une enquête ;
- maintenir des références relationnelles.

Champs possibles :

```text
deletedAt
deletedBy
deletionReason
deletionPolicyId
purgeAfter
```

La suppression logique n’est pas une purge définitive.

## 25. Suppression physique

La purge définitive doit supprimer ou rendre irrécupérable la donnée concernée dans les systèmes actifs.

Le processus doit inclure :

1. sélection selon politique ;
2. vérification legal hold ;
3. verrou anti-race ;
4. suppression des objets ;
5. suppression ou anonymisation base ;
6. suppression cache/index ;
7. émission d’une preuve technique ;
8. journal d’audit minimal.

## 26. Anonymisation

Une donnée anonymisée ne doit plus permettre raisonnablement de réidentifier une personne à partir des informations disponibles dans le périmètre prévu.

Exemples :

- suppression identifiants directs ;
- agrégation ;
- généralisation date/zone ;
- remplacement par catégories ;
- suppression des combinaisons rares.

L’anonymisation ne doit pas être confondue avec la pseudonymisation.

## 27. Pseudonymisation

La pseudonymisation conserve une possibilité contrôlée de rattachement.

Exemple :

```text
userId → stablePseudonymId
```

La table de correspondance doit être protégée séparément.

## 28. Legal hold

Un `LegalHold` empêche la purge de données précises lorsqu’une obligation l’exige.

Modèle :

```text
LegalHold
id
scopeType
scopeId
reason
countryCode
createdBy
approvedBy
startsAt
endsAt
status
```

Un legal hold ne doit jamais être créé silencieusement.

## 29. Conflit de règles

Ordre recommandé :

```text
LEGAL_HOLD
REGULATORY_MINIMUM
CONTRACTUAL_REQUIREMENT
TENANT_POLICY
DEFAULT_POLICY
```

Une politique locale ne doit pas réduire une conservation obligatoire supérieure.

## 30. Demande de suppression utilisateur

Une demande de suppression doit produire un dossier traçable.

États :

```text
REQUESTED
IDENTITY_VERIFICATION_REQUIRED
VERIFIED
IN_REVIEW
PARTIALLY_BLOCKED_BY_RETENTION
SCHEDULED
EXECUTING
COMPLETED
REJECTED
```

Le système doit expliquer clairement les catégories conservées pour obligation légitime sans exposer d’informations internes sensibles.

## 31. Fermeture de compte

La fermeture d’un compte doit distinguer :

- accès au service ;
- profil utilisateur ;
- moyens de paiement ;
- sessions ;
- données marketing ;
- données financières historiques ;
- conformité ;
- litiges ;
- audit.

Les sessions et credentials doivent être révoqués immédiatement.

Les archives obligatoires restent inaccessibles au client sauf droits spécifiques.

## 32. Export utilisateur

Formats recommandés :

```text
JSON
CSV
PDF
ZIP
```

L’export peut inclure :

- profil ;
- comptes ;
- transactions ;
- bénéficiaires ;
- paramètres ;
- consentements ;
- tickets support ;
- documents autorisés ;
- données de préférences.

Les secrets de sécurité ne doivent jamais être exportés.

## 33. Export entreprise/tenant

Une organisation doit pouvoir exporter uniquement ses propres données autorisées.

L’export doit respecter :

- périmètre tenant ;
- RBAC ;
- filtrage pays ;
- volume maximum ;
- génération asynchrone ;
- URL signée ;
- expiration ;
- chiffrement ;
- audit.

## 34. Exports volumineux

Workflow recommandé :

```text
REQUESTED
QUEUED
GENERATING
READY
DOWNLOADED
EXPIRED
FAILED
```

Le lien ne doit jamais être permanent.

## 35. Export avant suppression

Lorsqu’une fonction le permet, le produit peut proposer :

```text
Exporter mes données
Supprimer ensuite
```

L’utilisateur ou l’organisation doit être informé que certaines données réglementaires peuvent rester conservées.

## 36. Accès administratif

Les administrateurs ne doivent pas disposer d’un accès global illimité par défaut.

Tout accès à des données sensibles doit être :

- autorisé ;
- contextualisé ;
- audité ;
- limité dans le temps lorsque possible ;
- justifié pour les fonctions sensibles.

## 37. Break-glass

Un accès d’urgence peut exister pour incident critique.

Il doit exiger :

- rôle dédié ;
- justification ;
- MFA fort ;
- durée limitée ;
- audit renforcé ;
- revue ultérieure.

## 38. Résidence des données

Le modèle doit supporter plusieurs stratégies :

```text
GLOBAL_SHARED
REGIONAL
COUNTRY_PINNED
TENANT_PINNED
REGULATORY_PINNED
```

La stratégie réelle dépend de l’architecture, du partenaire, du pays et des exigences applicables.

## 39. Transferts inter-régions

Tout transfert entre régions doit être contrôlable par politique.

Le système doit savoir :

- source ;
- destination ;
- catégorie ;
- finalité ;
- base autorisée ;
- chiffrement ;
- sous-traitant éventuel.

## 40. Sauvegardes

Les sauvegardes doivent avoir une politique séparée.

Exigences :

- durée définie ;
- chiffrement ;
- restauration contrôlée ;
- inventaire ;
- expiration automatique ;
- accès restreint.

Une restauration ne doit pas réactiver silencieusement des comptes supprimés ni republier des données purgées dans les systèmes actifs.

## 41. Suppression dans les sauvegardes

Deux approches sont supportées selon architecture :

1. suppression ciblée lorsque techniquement possible ;
2. expiration naturelle des sauvegardes avec liste de suppression à réappliquer après restauration.

La seconde approche nécessite un `DeletionTombstoneRegistry` durable et séparé.

## 42. Tombstones de suppression

Modèle recommandé :

```text
DeletionTombstone
id
subjectType
subjectIdHash
dataCategory
requestedAt
executedAt
retainUntil
reason
```

Le tombstone ne doit pas recréer les données supprimées.

## 43. Caches et moteurs de recherche

Une purge doit couvrir :

- cache Redis ;
- moteur de recherche ;
- CDN ;
- previews ;
- files de messages ;
- objets temporaires ;
- fichiers générés.

Les TTL doivent être cohérents avec la politique de donnée source.

## 44. Files et événements

Les événements métier peuvent contenir des données personnelles.

Recommandation :

- minimiser payload ;
- référencer l’objet plutôt que copier tout le profil ;
- TTL des dead-letter queues ;
- purge des messages bloqués ;
- pas de secret dans les events.

## 45. Data lineage

Pour les domaines sensibles, Mansa doit pouvoir déterminer :

```text
source
transformation
destination
consumer
retentionPolicy
```

Le lineage est particulièrement important pour analytics, reporting, fraude et exports.

## 46. Catalogue de données

Le catalogue doit identifier :

- propriétaire métier ;
- propriétaire technique ;
- source de vérité ;
- tables/objets ;
- sensibilité ;
- pays ;
- règle de conservation ;
- consommateurs.

## 47. Source de vérité

Chaque donnée importante doit avoir une source officielle.

Exemples :

```text
ledger → source financière
identity service → identité applicative
KYC service → statut de conformité
payment service → état opérationnel paiement
device service → état terminal
```

Les exports analytiques ne doivent pas devenir source de vérité transactionnelle.

## 48. Moteur de rétention

Service recommandé :

```text
RetentionPolicyService
RetentionScheduler
RetentionExecutor
LegalHoldService
DataExportService
DeletionOrchestrator
RetentionAuditService
```

Le moteur doit fonctionner de manière idempotente.

## 49. Scheduler

Le scheduler identifie les objets éligibles sans les supprimer immédiatement.

Étapes :

```text
DISCOVER
MARK
GRACE_PERIOD
PURGE
VERIFY
REPORT
```

Cela permet de corriger une mauvaise politique avant destruction massive.

## 50. Période de grâce

Certaines catégories peuvent bénéficier d’une période de grâce configurable.

Exemple :

```text
eligibleAt
purgeScheduledAt
```

Un legal hold posé pendant cette période annule la purge.

## 51. Idempotence

Relancer un job de purge ne doit pas provoquer d’erreur critique ni recréer une donnée.

Les opérations doivent accepter :

```text
ALREADY_DELETED
ALREADY_ANONYMIZED
NOT_FOUND
LEGAL_HOLD_ACTIVE
```

## 52. Preuve de suppression

Mansa doit conserver une preuve minimale sans conserver la donnée supprimée.

Exemple :

```text
purgeJobId
dataCategory
recordCount
startedAt
completedAt
policyVersion
resultHash
```

## 53. Suppression multi-tenant

Chaque requête de purge doit inclure le contexte tenant.

Interdiction :

- requête non scopée sur une table multi-tenant ;
- suppression globale sans dry-run ;
- outil administrateur non audité.

## 54. Dry-run

Toute purge massive doit supporter :

```text
DRY_RUN
```

Le rapport doit indiquer :

- nombre d’objets ;
- catégories ;
- tenants ;
- volumes ;
- legal holds ;
- erreurs potentielles.

## 55. Seuils de sécurité

Des seuils doivent protéger contre un bug de purge.

Exemple :

```text
maxRecordsPerRun
maxTenantsPerRun
maxPercentagePerTable
requireApprovalAboveThreshold
```

## 56. Double validation

Les opérations exceptionnelles destructrices peuvent nécessiter deux rôles distincts.

Exemple :

```text
DATA_OPERATOR
DATA_APPROVER
```

## 57. API administratives

Exemples :

```text
GET /data-categories
GET /retention-policies
POST /retention-policies
POST /exports
GET /exports/:id
POST /deletion-requests
POST /legal-holds
DELETE /legal-holds/:id
POST /retention-runs/dry-run
POST /retention-runs/execute
```

Toutes doivent être protégées par RBAC et audit.

## 58. API utilisateur

Exemples :

```text
POST /me/data-export
GET /me/data-export/:id
POST /me/account-deletion
GET /me/account-deletion/:id
```

La vérification d’identité peut être exigée avant export ou suppression.

## 59. Modèle Prisma indicatif

Entités possibles :

```text
DataCategory
RetentionPolicy
RetentionPolicyVersion
LegalHold
DataExportRequest
DeletionRequest
DeletionTombstone
RetentionRun
RetentionRunItem
DataGovernanceAudit
```

## 60. Événements métier

Événements possibles :

```text
DATA_EXPORT_REQUESTED
DATA_EXPORT_READY
DATA_EXPORT_EXPIRED
DELETION_REQUESTED
DELETION_SCHEDULED
DELETION_COMPLETED
LEGAL_HOLD_CREATED
LEGAL_HOLD_RELEASED
RETENTION_POLICY_CHANGED
RETENTION_RUN_COMPLETED
RETENTION_RUN_FAILED
```

## 61. Permissions

Permissions recommandées :

```text
data.policy.read
data.policy.manage
data.export.self
data.export.tenant
data.deletion.self
data.deletion.review
data.deletion.execute
data.legal_hold.read
data.legal_hold.manage
data.retention.run
data.retention.approve
```

## 62. Rôles

Rôles possibles :

```text
DATA_STEWARD
COMPLIANCE_OFFICER
SECURITY_ADMIN
TENANT_ADMIN
SUPPORT_AGENT
AUDITOR
DATA_OPERATOR
DATA_APPROVER
```

Les permissions doivent rester plus fines que les rôles.

## 63. Chiffrement

Les données sensibles doivent être chiffrées au repos et en transit.

Pour certaines catégories, un chiffrement applicatif ou champ par champ peut être utilisé.

La rotation de clé ne doit pas modifier la durée de conservation.

## 64. Crypto-shredding

Lorsque l’architecture le permet, la destruction d’une clé dédiée peut rendre un jeu de données irrécupérable.

Cette technique doit être utilisée uniquement avec une gestion de clés robuste et un audit explicite.

## 65. Recherche utilisateur après anonymisation

Une donnée anonymisée ne doit plus apparaître dans :

- recherche utilisateur ;
- annuaire ;
- support courant ;
- recommandations ;
- marketing.

Les références financières peuvent rester sous identifiant technique.

## 66. Consentements et préférences

Les consentements doivent être versionnés.

Modèle :

```text
ConsentRecord
purpose
version
status
grantedAt
withdrawnAt
source
```

Le retrait d’un consentement doit empêcher les traitements futurs concernés mais ne supprime pas automatiquement toutes les données historiques lorsque leur conservation repose sur une autre base légitime.

## 67. Marketing

Les données marketing doivent être séparées des données nécessaires au compte.

Le désabonnement doit être appliqué rapidement.

Une liste minimale de suppression peut être conservée pour éviter de réinscrire automatiquement un utilisateur désabonné.

## 68. Environnements non production

Les données réelles ne doivent pas être copiées librement en développement ou test.

Préférences :

1. données synthétiques ;
2. données anonymisées ;
3. données pseudonymisées fortement contrôlées.

Toute copie exceptionnelle doit être autorisée et limitée.

## 69. Fixtures et démos

Les modes démo/recette doivent utiliser des identités et montants fictifs.

Aucun document KYC réel ne doit être inclus dans Git, fixtures ou captures de test.

## 70. Exports développeurs

Le portail développeur ne doit jamais exposer les données réelles d’un autre tenant.

La sandbox doit utiliser :

- utilisateurs fictifs ;
- transactions simulées ;
- webhooks de test ;
- documents factices.

## 71. Reporting conformité

Tableaux de bord possibles :

- données par catégorie ;
- volume par pays ;
- politiques actives ;
- objets éligibles à purge ;
- legal holds actifs ;
- exports générés ;
- demandes de suppression ;
- purges réussies/échouées ;
- stockage KYC ;
- stockage audio ;
- données hors politique.

## 72. Alertes

Alertes recommandées :

```text
RETENTION_JOB_FAILED
PURGE_VOLUME_ANOMALY
LEGAL_HOLD_CONFLICT
EXPORT_GENERATION_FAILED
DATA_OUTSIDE_RETENTION_WINDOW
BACKUP_RETENTION_EXCEEDED
UNSCOPED_TENANT_PURGE_ATTEMPT
```

## 73. Tests unitaires

Tester au minimum :

- calcul date d’éligibilité ;
- priorité des règles ;
- legal hold ;
- période de grâce ;
- anonymisation ;
- dry-run ;
- tenant scope ;
- export ;
- idempotence.

## 74. Tests d’intégration

Scénarios :

```text
création donnée
→ expiration politique
→ marquage
→ legal hold absent
→ purge
→ preuve de suppression
```

Et :

```text
création donnée
→ expiration
→ legal hold actif
→ aucune suppression
```

## 75. Tests multi-tenant

Ils sont obligatoires.

Scénario :

```text
Tenant A demande export/suppression
→ aucune donnée Tenant B dans résultat
```

Une fuite inter-tenant est bloquante.

## 76. Tests restauration sauvegarde

Une restauration doit vérifier :

- réapplication tombstones ;
- comptes supprimés non réactivés ;
- données expirées repurgées ;
- audit conservé.

## 77. Tests Jini Voice

Tester :

- enregistrement désactivé ;
- transcription conservée seule ;
- export avant suppression ;
- purge audio ;
- purge transcript ;
- conservation résumé métier ;
- tenant isolation.

## 78. Tests péage

Tester séparément :

- transaction péage conservée ;
- image ANPR expirée ;
- événement RFID conservé selon règle ;
- audit ouverture manuelle conservé ;
- purge hors ligne après synchronisation.

## 79. Performance

Les purges doivent fonctionner par batch.

Éviter :

- transaction géante ;
- verrou global ;
- scan complet non indexé ;
- surcharge aux heures de pointe.

Le scheduler doit supporter pagination et reprise.

## 80. Indexation

Champs à indexer selon modèles :

```text
createdAt
deletedAt
purgeAfter
tenantId
countryCode
policyId
status
```

## 81. Observabilité

Chaque job doit exposer :

```text
recordsScanned
recordsEligible
recordsDeleted
recordsAnonymized
recordsSkippedLegalHold
recordsFailed
durationMs
```

Les métriques ne doivent pas contenir de données personnelles brutes.

## 82. Incidents

Une purge erronée est un incident majeur potentiel.

Actions possibles :

- stopper scheduler ;
- désactiver policy ;
- isoler job ;
- préserver preuves ;
- restaurer lorsque approprié ;
- déclencher revue sécurité/conformité.

## 83. Rollback de politique

Les politiques doivent être versionnées et réversibles avant exécution destructive.

Une fois une donnée physiquement supprimée, un rollback de configuration ne doit pas prétendre la restaurer.

## 84. Import de données

Lors d’une migration, chaque donnée importée doit recevoir :

- date d’origine si disponible ;
- catégorie ;
- politique ;
- pays ;
- tenant.

Ne pas réinitialiser artificiellement le compteur de conservation à la date de migration sans justification.

## 85. Données partenaires

Lorsqu’un partenaire conserve une copie, Mansa doit pouvoir enregistrer :

```text
processorName
purpose
countryOrRegion
dataCategories
contractReference
retentionExpectation
deletionMechanism
```

La suppression interne ne signifie pas automatiquement suppression chez le partenaire ; un workflow externe peut être nécessaire.

## 86. Demande de suppression partenaire

Statuts possibles :

```text
NOT_REQUIRED
QUEUED
SENT
ACKNOWLEDGED
COMPLETED
FAILED
```

Le résultat doit être audité.

## 87. Matériel perdu ou compromis

Lorsqu’un TPE, téléphone, tablette ou contrôleur local est perdu :

- révoquer credentials ;
- empêcher nouvelle synchronisation ;
- déclencher wipe distant lorsque supporté ;
- marquer les données locales comme à risque ;
- auditer l’incident.

## 88. Données sur appareils utilisateurs

Les apps mobiles doivent limiter les données persistantes locales.

Éviter :

- relevé complet en clair ;
- document KYC dans cache permanent ;
- token sensible dans stockage non sécurisé ;
- historique illimité de contenu support.

## 89. Données de géolocalisation

Toute géolocalisation doit avoir une finalité claire.

Différencier :

```text
LIVE_LOCATION
TRANSACTION_LOCATION
DEVICE_SECURITY_LOCATION
DELIVERY_LOCATION
ANALYTICS_LOCATION
```

Les durées peuvent être différentes.

## 90. Données biométriques

Mansa doit éviter de stocker une biométrie brute lorsqu’une API système peut fournir seulement un résultat d’authentification.

Pour Face ID/Touch ID Android/iOS : conserver uniquement le fait que l’authentification locale a réussi, pas l’empreinte ou le visage.

## 91. Données mineurs et comptes spécifiques

Si des produits futurs concernent des mineurs, la classification et la conservation doivent supporter des règles dédiées par pays et par type de compte.

Aucune règle globale implicite ne doit être appliquée.

## 92. Administration publique

Les données de l’État doivent pouvoir être isolées par :

- ministère ;
- agence ;
- collectivité ;
- service ;
- pays ;
- niveau d’habilitation.

Les règles de conservation peuvent différer des règles grand public.

## 93. Marque blanche

La personnalisation État/concessionnaire ou entreprise n’altère jamais les règles de sécurité ni de rétention.

Un tenant peut configurer des durées dans les limites autorisées, mais ne peut pas désactiver une conservation obligatoire.

## 94. Configuration administrative

Écran recommandé :

```text
Données
├── Catégories
├── Conservation
├── Exports
├── Suppressions
├── Legal holds
├── Résidence
├── Partenaires
└── Rapports
```

## 95. UX utilisateur

Les interfaces doivent éviter les formulations ambiguës.

Exemple :

```text
Supprimer mon compte

Votre accès et vos données non obligatoires seront supprimés.
Certaines données financières ou réglementaires peuvent être conservées pendant la durée légalement requise.
Vous pouvez exporter vos données avant de continuer.
```

## 96. UX export

Afficher :

- date demande ;
- état ;
- format ;
- expiration lien ;
- taille approximative ;
- sécurité du téléchargement.

## 97. Sécurité de l’export

Exiger selon risque :

- réauthentification ;
- MFA ;
- OTP ;
- notification de sécurité ;
- délai anti-fraude.

Un attaquant ayant une session compromise ne doit pas pouvoir exfiltrer facilement tout le compte.

## 98. Journalisation des exports

Chaque export doit produire :

```text
EXPORT_CREATED
EXPORT_READY
EXPORT_DOWNLOADED
EXPORT_EXPIRED
EXPORT_REVOKED
```

Le fichier lui-même ne doit pas être conservé indéfiniment.

## 99. Révocation d’export

Un export prêt mais non téléchargé doit pouvoir être révoqué.

Les liens signés expirent automatiquement.

## 100. Critères d’acceptation

Le domaine est considéré correctement implémenté lorsque :

1. chaque catégorie sensible possède une politique explicite ;
2. les politiques sont configurables par pays ;
3. les données expirées sont détectées automatiquement ;
4. les legal holds bloquent la purge ;
5. les purges sont idempotentes ;
6. les purges massives supportent dry-run et seuils ;
7. l’isolation multi-tenant est testée ;
8. les exports sont sécurisés et expirants ;
9. les données Jini Voice ont des durées courtes configurables ;
10. l’export avant suppression est possible lorsque activé ;
11. les sauvegardes ne restaurent pas silencieusement les données purgées ;
12. une preuve minimale de suppression est conservée ;
13. les documents KYC sont séparés des profils courants ;
14. les images ANPR peuvent expirer indépendamment des transactions péage ;
15. aucun secret n’est inclus dans les exports, logs ou fixtures.

## 101. Ordre d’implémentation recommandé

### Phase 1

- catalogue de catégories ;
- politiques de conservation ;
- moteur d’éligibilité ;
- dry-run ;
- suppression logique ;
- audit.

### Phase 2

- suppression physique ;
- anonymisation ;
- exports ;
- legal hold ;
- multi-pays.

### Phase 3

- sauvegardes/tombstones ;
- partenaires ;
- data lineage ;
- résidence avancée ;
- reporting conformité.

### Phase 4

- automatisation complète ;
- approbations ;
- contrôles de dérive ;
- optimisation stockage.

## 102. Règle finale

Mansa doit être capable de répondre, pour toute donnée importante, aux questions suivantes :

```text
Quelle donnée est-ce ?
Pourquoi est-elle conservée ?
Qui peut y accéder ?
Dans quel pays ou quelle région se trouve-t-elle ?
Combien de temps doit-elle rester ?
Quand sera-t-elle supprimée ou anonymisée ?
Existe-t-il un legal hold ?
Peut-elle être exportée ?
Quelle preuve reste après suppression ?
```

Aucune donnée sensible ne doit rester indéfiniment simplement parce qu’aucun mécanisme de purge n’a été implémenté.
