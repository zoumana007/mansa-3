# Cahier des charges — Gouvernance des données personnelles, consentement, conservation, export et suppression

## 1. Objet

Ce document définit les exigences Mansa relatives à la collecte, à l’utilisation, à la conservation, à l’export, à la suppression, à l’anonymisation, au consentement et à la traçabilité des données personnelles et sensibles traitées par l’écosystème Mansa.

L’objectif est de disposer d’un cadre unique, multi-pays et multi-tenant permettant aux applications Mansa, aux commerçants, aux entreprises, aux agents, aux administrations, aux services publics, aux partenaires financiers, à Jini Voice, aux bornes, aux terminaux, aux portails et aux outils internes de traiter les données de manière proportionnée, auditable et techniquement maîtrisée.

Le système ne doit pas conserver une donnée uniquement parce qu’elle peut être utile un jour. Toute donnée doit être rattachée à une finalité, une base de traitement, une durée de conservation et une politique de suppression ou d’archivage.

## 2. Principes directeurs

Mansa doit appliquer les principes suivants :

1. minimisation des données ;
2. limitation des finalités ;
3. durées de conservation explicites ;
4. suppression ou anonymisation automatique à échéance lorsque cela est applicable ;
5. séparation stricte entre tenants, pays, organisations et environnements ;
6. chiffrement des données sensibles au repos et en transit ;
7. accès selon le moindre privilège ;
8. journalisation des accès sensibles et opérations d’administration ;
9. export contrôlé avant suppression lorsque l’utilisateur ou l’organisation y a droit ;
10. aucune donnée sensible ne doit être placée dans les logs techniques sans nécessité ;
11. les données de test ne doivent pas reproduire inutilement des données personnelles de production ;
12. les consentements doivent être versionnés et auditables ;
13. les obligations légales ou réglementaires peuvent empêcher une suppression immédiate de certaines données ;
14. un effacement fonctionnel ne doit pas être confondu avec une destruction physique instantanée de toutes les sauvegardes ;
15. Mansa doit pouvoir prouver pourquoi une donnée existe encore.

## 3. Périmètre

Le domaine couvre notamment :

- profils utilisateurs ;
- numéros de téléphone ;
- adresses e-mail ;
- adresses postales ;
- identifiants officiels ;
- documents KYC/KYB ;
- photographies et selfies ;
- données biométriques si un usage est autorisé ;
- données de paiement et références transactionnelles ;
- comptes, wallets et historiques ;
- données commerçants et entreprises ;
- données agents ;
- données État et services publics ;
- données de mobilité, péage, RFID et ANPR ;
- plaques d’immatriculation ;
- géolocalisation lorsque utilisée ;
- données de support ;
- réclamations et litiges ;
- données d’appels Jini Voice ;
- transcriptions ;
- résumés d’appels ;
- messages ;
- pièces jointes ;
- journaux d’audit ;
- journaux de sécurité ;
- données analytiques ;
- données marketing ;
- préférences ;
- consentements ;
- données exportées ;
- archives et sauvegardes.

## 4. Classification des données

Chaque type de donnée doit être classé.

```text
PUBLIC
INTERNAL
PERSONAL
SENSITIVE_PERSONAL
FINANCIAL
IDENTITY_CRITICAL
PAYMENT_CRITICAL
GOVERNMENT_SENSITIVE
SECURITY_CRITICAL
```

Exemples :

- nom public d’un commerce : `PUBLIC` ;
- numéro de téléphone client : `PERSONAL` ;
- pièce d’identité : `IDENTITY_CRITICAL` ;
- historique transactionnel : `FINANCIAL` ;
- secret de sécurité : `SECURITY_CRITICAL` ;
- donnée administrative sensible : `GOVERNMENT_SENSITIVE`.

## 5. Registre des catégories de données

Mansa doit maintenir un registre logique permettant d’identifier :

```text
DataCategory
DataField
DataPurpose
LegalBasisOrPolicyBasis
RetentionPolicy
DeletionPolicy
ExportPolicy
AccessPolicy
MaskingPolicy
EncryptionPolicy
ResidencyPolicy
```

Chaque catégorie doit préciser au minimum :

- nom ;
- description ;
- produit concerné ;
- tenant concerné ;
- finalité ;
- criticité ;
- durée de conservation ;
- règle de suppression ;
- règle d’export ;
- responsables autorisés ;
- obligations empêchant éventuellement l’effacement immédiat.

## 6. Finalité obligatoire

Aucune collecte importante ne doit être créée sans finalité déclarée.

Exemples de finalités :

```text
ACCOUNT_CREATION
IDENTITY_VERIFICATION
PAYMENT_EXECUTION
FRAUD_PREVENTION
LEGAL_COMPLIANCE
CUSTOMER_SUPPORT
SERVICE_OPERATION
SECURITY_MONITORING
ANALYTICS
MARKETING
VOICE_ASSISTANCE
TOLL_OPERATION
PUBLIC_SERVICE
```

Une même donnée peut servir plusieurs finalités uniquement si cela est explicitement prévu.

## 7. Bases de traitement et politiques locales

Le moteur doit permettre de rattacher chaque traitement à une justification configurable selon le pays, la réglementation, le contrat ou la politique interne.

Valeurs génériques possibles :

```text
CONTRACT
LEGAL_OBLIGATION
CONSENT
LEGITIMATE_OPERATIONAL_NEED
SECURITY_REQUIREMENT
PUBLIC_TASK
REGULATORY_REQUIREMENT
```

La terminologie exacte peut être adaptée juridiquement par pays sans modifier le modèle technique central.

## 8. Consentements

Les consentements doivent être stockés comme événements versionnés et non comme simple booléen écrasable.

Entité recommandée :

```text
ConsentRecord
```

Champs minimaux :

```text
id
subjectId
organizationId
countryCode
purpose
policyVersion
status
capturedAt
withdrawnAt
channel
locale
sourceDeviceId
proofReference
createdAt
```

États :

```text
GRANTED
DENIED
WITHDRAWN
EXPIRED
NOT_REQUIRED
```

## 9. Preuve du consentement

Lorsqu’un consentement est requis, Mansa doit pouvoir prouver :

- ce qui a été accepté ;
- quelle version du texte était affichée ;
- dans quelle langue ;
- à quelle date ;
- via quel canal ;
- pour quelle finalité ;
- quand il a été retiré le cas échéant.

## 10. Retrait du consentement

Le retrait doit :

1. être simple ;
2. arrêter les traitements futurs dépendant uniquement de ce consentement ;
3. ne pas supprimer automatiquement des données encore nécessaires pour une autre base valide ;
4. déclencher les tâches de nettoyage appropriées ;
5. être audité.

## 11. Politique de conservation

Chaque catégorie doit être liée à une `RetentionPolicy`.

Champs recommandés :

```text
id
name
countryCode
organizationId
dataCategory
retentionDuration
retentionAnchor
postExpiryAction
legalHoldAllowed
archiveAllowed
activeFrom
activeTo
version
```

## 12. Point de départ de conservation

La durée ne doit pas toujours être calculée depuis la création.

Ancres possibles :

```text
CREATED_AT
LAST_ACTIVITY_AT
ACCOUNT_CLOSED_AT
TRANSACTION_SETTLED_AT
CASE_CLOSED_AT
CONTRACT_ENDED_AT
CONSENT_WITHDRAWN_AT
CALL_ENDED_AT
DEVICE_DECOMMISSIONED_AT
CUSTOM_ANCHOR
```

## 13. Actions à échéance

```text
DELETE
ANONYMIZE
PSEUDONYMIZE
ARCHIVE
RESTRICT_ACCESS
REVIEW_REQUIRED
```

L’action doit être déterminée par la catégorie et les obligations applicables.

## 14. Suppression logique et suppression physique

Mansa doit distinguer :

```text
SOFT_DELETE
HARD_DELETE
CRYPTO_SHRED
ANONYMIZATION
```

Le `SOFT_DELETE` seul n’est pas une suppression définitive.

Les données devant réellement disparaître doivent être effacées des bases actives selon la politique prévue.

## 15. Suppression dans les sauvegardes

Les sauvegardes immuables peuvent conserver temporairement une donnée supprimée des systèmes actifs jusqu’à expiration normale du backup.

Exigences :

- la donnée ne doit pas être restaurée dans un usage actif sans réapplication des suppressions ;
- une restauration doit rejouer le registre des suppressions ;
- les sauvegardes ont une rétention bornée ;
- les accès aux sauvegardes sont restreints ;
- aucune restauration ne doit réactiver un compte ou consentement supprimé par erreur.

## 16. Registre des suppressions

Entité recommandée :

```text
DeletionRequest
DeletionExecution
```

Champs minimaux :

```text
requestId
subjectId
organizationId
requestedAt
requestedBy
reason
scope
status
blockedReason
scheduledAt
executedAt
verificationStatus
```

États :

```text
REQUESTED
VALIDATING
BLOCKED
SCHEDULED
EXECUTING
PARTIALLY_COMPLETED
COMPLETED
REJECTED
CANCELLED
```

## 17. Restrictions légales et conservation obligatoire

Une demande de suppression peut être partiellement bloquée si certaines données doivent être conservées.

Le système doit alors :

- supprimer ce qui peut l’être ;
- verrouiller les données conservées ;
- indiquer la raison ;
- limiter leur usage ;
- empêcher leur réutilisation marketing ou fonctionnelle ;
- prévoir une date de réévaluation.

## 18. Legal hold

Pour litige, enquête, fraude ou obligation officielle, certaines données peuvent être placées sous conservation forcée.

Entité :

```text
LegalHold
```

Champs :

```text
id
scopeType
scopeId
reason
authority
createdBy
approvedBy
startedAt
expiresAt
releasedAt
status
```

Aucun legal hold ne doit être créé silencieusement sans audit.

## 19. Export des données

Mansa doit permettre l’export des données lorsque le produit ou le cadre applicable l’exige.

Formats possibles :

```text
JSON
CSV
PDF
ZIP
```

Les données structurées doivent privilégier JSON/CSV.

Les documents et justificatifs peuvent être regroupés dans une archive sécurisée.

## 20. Export avant suppression

Lorsqu’une suppression est demandée, l’utilisateur ou l’organisation peut, si autorisé, exporter ses données avant exécution.

Le système doit :

1. générer l’export ;
2. le chiffrer si nécessaire ;
3. créer un lien temporaire ;
4. limiter le nombre de téléchargements si utile ;
5. supprimer l’archive après expiration ;
6. auditer la génération et le téléchargement.

Pour les modules de conversation ou téléphonie, cette possibilité d’export ne doit pas justifier une conservation prolongée côté Mansa.

## 21. Jini Voice — principe de conservation minimale

Les appels, messages et transcriptions Jini Voice doivent avoir des durées limitées et configurables.

Par défaut, la plateforme doit favoriser :

- conservation courte de l’audio ;
- transcription conservée uniquement selon besoin métier ;
- résumé conservé moins longtemps si possible ;
- suppression des artefacts techniques intermédiaires ;
- export par l’organisation avant suppression ;
- possibilité pour l’organisation de conserver ensuite l’export sur son propre stockage.

La réduction de rétention doit limiter à la fois le risque et le coût de stockage.

## 22. Données vocales

Catégories :

```text
CALL_AUDIO
TRANSCRIPT
SUMMARY
VOICEMAIL
CALL_METADATA
LANGUAGE_DETECTION_METADATA
```

Les politiques peuvent différer entre ces catégories.

L’audio brut doit généralement avoir une rétention plus courte que les métadonnées nécessaires à la facturation ou à l’audit.

## 23. Messages et conversations IA

Les conversations avec Jini doivent pouvoir être configurées avec :

```text
retentionDays
exportBeforeDeletion
allowHumanReview
allowModelImprovementUse
maskSensitiveData
```

Aucune utilisation secondaire ne doit être activée implicitement si elle nécessite un accord spécifique.

## 24. Données KYC/KYB

Les pièces d’identité et documents d’entreprise sont des données à haute sensibilité.

Exigences :

- chiffrement applicatif lorsque nécessaire ;
- accès limité ;
- consultation auditée ;
- liens temporaires ;
- masquage dans les interfaces ;
- aucune URL publique permanente ;
- politiques de conservation spécifiques ;
- suppression ou archivage contrôlé après expiration.

## 25. Données financières

Les transactions, mouvements de ledger, rapprochements et données nécessaires à la preuve financière ne doivent pas être supprimés de façon à casser l’intégrité comptable.

La suppression d’un utilisateur ne doit jamais supprimer les écritures comptables nécessaires à la cohérence du ledger.

À la place, les données personnelles non nécessaires peuvent être séparées, masquées ou pseudonymisées selon les obligations applicables.

## 26. Péages et mobilité

Pour les domaines péage et mobilité, les données peuvent inclure :

- plaque ANPR ;
- tag RFID ;
- identifiant véhicule ;
- catégorie ;
- passage ;
- voie ;
- poste ;
- image éventuelle ;
- transaction ;
- ouverture de barrière ;
- incident.

Ces données doivent avoir des politiques distinctes selon leur finalité : paiement, lutte contre la fraude, exploitation, contentieux ou statistiques.

Les images ANPR ne doivent pas être conservées indéfiniment par défaut.

## 27. Exigences de référence péage

Les règles de protection des données ne modifient pas l’architecture fonctionnelle de référence du domaine péage.

Mansa doit conserver simultanément :

- solution A : péage automatique classique avec barrière ;
- solution B : télépéage RFID UHF passif avec barrière ;
- évolution future optionnelle : free-flow sans barrière, sans supprimer ni remplacer les deux solutions initiales.

Le péage classique peut accepter, selon configuration :

- billets FCFA/XOF ;
- pièces FCFA/XOF ;
- carte EMV multi-réseaux selon les réseaux activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

Mobile Money doit rester activable ou désactivable par administration aux niveaux national, réseau, poste ou voie, avec date d’effet et audit.

Le télépéage initial conserve : tag UHF RFID passif, véhicule, compte, lecteur/antenne, contrôleur local, relais `OPEN`, barrière et capteurs de passage.

Le mode local/hors ligne doit rester sécurisé, resynchronisable et protégé contre le double débit.

Le matériel reste multi-fournisseurs derrière des adaptateurs et interfaces documentées.

Les trois niveaux d’équipement restent supportés : voie automatique complète, voie semi-automatique sécurisée et poste numérisé à faible coût.

Le déploiement reste progressif et les modèles commerciaux peuvent être : matériel acheté par l’État/concessionnaire ou matériel fourni/intégré/revendu par Mansa.

La personnalisation marque blanche doit couvrir bornes, tags, écrans, reçus et signalétique, avec mention facultative `Propulsé par Mansa`.

Le rapprochement anti-corruption doit conserver la chaîne véhicule détecté → catégorie → tarif attendu → paiement → ouverture → passage physique. Toute ouverture manuelle doit rester auditée.

## 28. Données État

Les données traitées pour une administration doivent être séparées selon :

```text
countryCode
ministryOrAgencyId
organizationId
serviceId
legalPurpose
classification
```

Une administration ne doit pas accéder aux données d’une autre entité publique sauf délégation explicite.

Les règles de conservation peuvent être différentes de celles des produits grand public.

## 29. Données commerçants et entreprises

Les données professionnelles doivent distinguer :

- données de l’entreprise ;
- données personnelles du représentant ;
- données des employés ;
- données clients ;
- données transactionnelles ;
- données de catalogue non personnelles.

La suppression d’un employé ne doit pas supprimer les données historiques de l’entreprise nécessaires à l’exploitation.

## 30. Multi-tenant

Toute requête d’accès, export, suppression ou modification doit être limitée au tenant compétent.

La couche d’accès doit vérifier au minimum :

```text
subjectId
organizationId
tenantId
countryCode
actorId
actorRole
purpose
```

Une simple connaissance d’un identifiant ne doit jamais permettre de récupérer les données d’un autre tenant.

## 31. Contrôle d’accès aux données sensibles

Les opérations suivantes peuvent nécessiter une permission dédiée :

```text
data.personal.read
identity.document.read
privacy.export.create
privacy.deletion.create
privacy.deletion.approve
privacy.legalhold.create
privacy.legalhold.release
privacy.retention.manage
privacy.consent.read
privacy.audit.read
```

## 32. Masquage

Les interfaces doivent masquer par défaut les données sensibles.

Exemples :

```text
+223 ** ** ** 42
**** **** **** 1234
AB****78
z***@example.com
```

L’affichage complet peut nécessiter une action explicite et un audit selon le niveau de sensibilité.

## 33. Journaux applicatifs

Les logs ne doivent pas contenir en clair :

- mot de passe ;
- PIN ;
- secret OTP ;
- clé API ;
- token complet ;
- document d’identité brut ;
- audio complet ;
- contenu de carte ;
- données biométriques ;
- données bancaires sensibles non nécessaires.

## 34. Corrélation sans exposition

Pour diagnostiquer un incident, privilégier :

```text
requestId
traceId
transactionId
userId interne
organizationId
maskedReference
hashReference
```

plutôt que les données personnelles brutes.

## 35. Analytics

Les données analytiques doivent être minimisées.

Quand l’identité n’est pas nécessaire :

- agréger ;
- pseudonymiser ;
- réduire la précision ;
- séparer l’identité du comportement ;
- appliquer une rétention spécifique.

## 36. Marketing

Les préférences marketing doivent être séparées des préférences opérationnelles.

Un utilisateur peut refuser le marketing sans bloquer les notifications nécessaires à la sécurité ou à l’exécution du service.

## 37. Notifications

Les notifications peuvent contenir des données sensibles.

Règles :

- ne pas exposer inutilement le solde ou la nature sensible d’une opération sur écran verrouillé ;
- permettre des paramètres de confidentialité ;
- limiter les données dans SMS et push ;
- ne jamais inclure de secret d’authentification permanent.

## 38. Appareils perdus

La révocation d’un appareil doit empêcher de nouveaux accès aux données synchronisées.

Les applications doivent limiter les données sensibles persistées localement et utiliser le stockage sécurisé de la plateforme lorsque disponible.

## 39. Données hors ligne

Les terminaux agents, TPE, bornes et applications hors ligne peuvent conserver temporairement des données.

Exigences :

- chiffrement local ;
- limite de durée ;
- limite de volume ;
- purge après synchronisation ;
- protection contre copie ;
- effacement lors du décommissionnement ;
- journalisation des synchronisations.

## 40. Suppression sur appareils

Lorsqu’un compte est supprimé ou un terminal révoqué, le backend doit pouvoir transmettre une commande de purge ou rendre les données locales cryptographiquement inutilisables selon les capacités techniques.

## 41. Résidence des données

L’architecture doit pouvoir appliquer des politiques de localisation ou séparation des données par :

```text
COUNTRY
REGION
LEGAL_ENTITY
TENANT
DATA_CATEGORY
```

Le code métier ne doit pas supposer qu’une seule région de stockage suffit à tous les pays.

## 42. Transferts inter-systèmes

Chaque intégration doit préciser :

- données envoyées ;
- finalité ;
- fréquence ;
- chiffrement ;
- authentification ;
- rétention côté partenaire ;
- responsabilité de suppression ;
- journalisation ;
- comportement en cas d’échec.

## 43. Partenaires

Un partenaire ne doit recevoir que les données nécessaires à son rôle.

Exemples :

- acquéreur carte ;
- banque partenaire ;
- opérateur Mobile Money ;
- fournisseur KYC ;
- fournisseur téléphonie ;
- administration ;
- transporteur ;
- hébergeur.

## 44. Sous-traitants techniques

Le registre des fournisseurs doit indiquer les catégories de données qu’ils peuvent traiter.

Aucun nouveau fournisseur ne doit être branché à une base complète uniquement par facilité technique.

## 45. Environnements non production

Les environnements de développement et test doivent utiliser :

- données fictives ;
- données synthétiques ;
- données anonymisées ;
- sous-ensembles fortement masqués lorsque nécessaire.

Une copie brute de production vers un environnement développeur doit être interdite par défaut.

## 46. Tests automatisés

Les tests doivent couvrir :

- isolation tenant ;
- export autorisé ;
- export interdit ;
- suppression partielle ;
- suppression complète ;
- legal hold ;
- consentement retiré ;
- conservation expirée ;
- anonymisation ;
- restauration après backup ;
- purge de données hors ligne ;
- refus d’accès à un document KYC non autorisé.

## 47. Moteur de rétention

Un service dédié peut exécuter les politiques de conservation.

Architecture recommandée :

```text
Retention Scheduler
        ↓
Policy Resolver
        ↓
Eligibility Evaluator
        ↓
Deletion / Anonymization Worker
        ↓
Verification Worker
        ↓
Audit Log
```

Le traitement doit être idempotent.

## 48. Jobs de suppression

Les jobs doivent :

- être reprenables ;
- supporter de gros volumes ;
- éviter les locks globaux ;
- enregistrer les erreurs ;
- retenter de manière bornée ;
- ne pas supprimer deux fois un objet de manière destructive ;
- produire une preuve d’exécution.

## 49. Vérification après suppression

Le statut `COMPLETED` ne doit être posé qu’après vérification des systèmes concernés.

La vérification peut inclure :

- absence de ligne active ;
- absence de fichier objet ;
- révocation du lien ;
- suppression de l’index de recherche ;
- suppression du cache ;
- purge de la file différée ;
- anonymisation confirmée.

## 50. Caches et moteurs de recherche

Une suppression doit également cibler :

- Redis/cache ;
- index de recherche ;
- CDN privé ;
- miniatures ;
- exports temporaires ;
- files différées ;
- snapshots applicatifs temporaires.

## 51. Fichiers et stockage objet

Les documents doivent utiliser des identifiants opaques.

Les URLs d’accès doivent être temporaires.

La suppression doit inclure les versions ou dérivés lorsque la politique l’exige.

## 52. Export sécurisé

Un export sensible doit pouvoir être protégé par :

- chiffrement ;
- mot de passe transmis séparément si utilisé ;
- lien signé ;
- expiration ;
- authentification forte ;
- audit du téléchargement.

## 53. Audit

Événements à auditer :

```text
CONSENT_GRANTED
CONSENT_WITHDRAWN
EXPORT_REQUESTED
EXPORT_GENERATED
EXPORT_DOWNLOADED
DELETION_REQUESTED
DELETION_BLOCKED
DELETION_EXECUTED
RETENTION_POLICY_CHANGED
LEGAL_HOLD_CREATED
LEGAL_HOLD_RELEASED
SENSITIVE_DATA_VIEWED
SENSITIVE_DATA_EXPORTED
```

## 54. Alertes

Le système peut alerter sur :

- export massif inhabituel ;
- consultation répétée de documents sensibles ;
- suppression anormalement volumineuse ;
- changement de politique de rétention ;
- legal hold créé sans approbation ;
- données expirées non supprimées ;
- données dans une région interdite ;
- fichier sensible publiquement accessible.

## 55. Administration

Le portail d’administration doit permettre :

- consulter les politiques ;
- voir les prochaines expirations ;
- examiner les suppressions bloquées ;
- suivre les exports ;
- gérer les legal holds selon permissions ;
- consulter les erreurs de purge ;
- voir les métriques de conformité opérationnelle.

Il ne doit pas permettre de modifier rétroactivement les preuves d’audit.

## 56. Métriques

Exemples :

```text
expired_records_pending
records_deleted_total
records_anonymized_total
deletion_failures_total
export_requests_total
export_generation_duration
legal_holds_active
retention_policy_violations
sensitive_access_events
```

Les métriques ne doivent pas elles-mêmes exposer de données personnelles.

## 57. Gestion des incidents de données

En cas d’exposition suspectée, Mansa doit pouvoir déterminer :

- quelles catégories ont été touchées ;
- quels tenants ;
- quels utilisateurs ;
- quelle période ;
- quel acteur ou credential ;
- quels exports ont eu lieu ;
- quelles mesures de confinement ont été prises.

Cette exigence dépend directement de l’audit et de la classification des données.

## 58. Droit d’accès interne

Même lorsque la loi locale n’impose pas un mécanisme utilisateur particulier, Mansa doit conserver techniquement la capacité de reconstruire les données liées à un sujet afin de répondre à des demandes légitimes, enquêtes internes ou obligations contractuelles.

## 59. Fermeture de compte

La fermeture doit distinguer :

```text
ACCOUNT_DISABLED
ACCOUNT_CLOSED
DELETION_REQUESTED
DELETION_COMPLETED
```

Fermer un compte ne signifie pas immédiatement supprimer toutes les données financières, réglementaires ou d’audit.

## 60. Réactivation

Un compte ayant fait l’objet d’une suppression définitive ne doit pas être silencieusement restauré depuis une archive.

Une nouvelle inscription doit créer une nouvelle identité logique si nécessaire.

## 61. Pseudonymisation

Lorsque l’identité directe n’est plus requise mais que les données doivent être conservées pour statistiques, risque ou preuve, utiliser une pseudonymisation ou anonymisation adaptée.

Les tables de correspondance doivent être protégées séparément.

## 62. Anonymisation

Une donnée réellement anonymisée ne doit pas pouvoir être raisonnablement réattribuée à une personne via les informations conservées par Mansa.

Supprimer uniquement le nom tout en conservant téléphone, adresse et identifiant unique n’est pas une anonymisation suffisante.

## 63. Données dérivées et IA

Les données dérivées par IA doivent hériter d’une politique de protection.

Exemples :

- score de risque ;
- résumé de conversation ;
- classification d’intention ;
- catégorie comportementale ;
- détection de langue.

La suppression de la donnée source doit déclencher l’évaluation des dérivés liés.

## 64. Entraînement et amélioration de modèles

Les données clients ne doivent pas être utilisées automatiquement pour entraîner ou améliorer un modèle si cette utilisation n’est pas explicitement prévue et autorisée.

Les réglages d’organisation doivent permettre de désactiver tout usage optionnel de ce type.

## 65. Données de mineurs

Si un produit peut traiter des données de mineurs, une politique spécifique doit être applicable :

- minimisation renforcée ;
- consentements ou autorisations adaptés ;
- accès plus restreint ;
- marketing limité ;
- conservation réduite lorsque possible.

## 66. Gouvernance des changements

Toute modification d’une politique de rétention doit être versionnée.

Champs :

```text
previousVersion
newVersion
changedBy
approvedBy
reason
effectiveAt
impactEstimate
```

## 67. Rollout

Une nouvelle politique peut être appliquée progressivement.

Avant suppression massive :

1. mode simulation ;
2. comptage des éléments concernés ;
3. échantillon de validation ;
4. approbation ;
5. exécution par lots ;
6. vérification ;
7. rapport final.

## 68. Mode simulation

Le moteur de rétention doit supporter un `DRY_RUN` qui liste ce qui serait supprimé sans effectuer l’action.

Ce mode est obligatoire pour les changements de politique à fort impact.

## 69. API recommandées

```text
POST /privacy/consents
DELETE /privacy/consents/:purpose
POST /privacy/exports
GET /privacy/exports/:id
POST /privacy/deletions
GET /privacy/deletions/:id
POST /admin/privacy/legal-holds
DELETE /admin/privacy/legal-holds/:id
GET /admin/privacy/retention-policies
POST /admin/privacy/retention-policies
POST /admin/privacy/retention-policies/:id/dry-run
```

Les routes exactes peuvent évoluer mais les capacités doivent rester présentes.

## 70. Modèle de données minimal

```text
DataCategory
DataPurpose
ConsentRecord
RetentionPolicy
RetentionExecution
DeletionRequest
DeletionExecution
ExportRequest
ExportArtifact
LegalHold
DataAccessAudit
DataResidencyPolicy
PrivacyPolicyVersion
```

## 71. Idempotence

Les demandes de suppression et d’export doivent supporter une clé d’idempotence afin d’éviter des duplications coûteuses ou contradictoires.

## 72. Sécurité des exports

Les exports ne doivent jamais être stockés durablement dans un bucket public.

Ils doivent expirer automatiquement.

Un ancien lien doit cesser de fonctionner après expiration ou révocation.

## 73. Performance

Les suppressions volumineuses doivent être asynchrones.

Le système doit éviter de bloquer les transactions en ligne pendant les purges.

Les index nécessaires au calcul des échéances doivent être prévus.

## 74. Résilience

En cas de panne pendant un job :

- reprise depuis checkpoint ;
- aucune réapparition d’éléments déjà supprimés ;
- statut cohérent ;
- journal d’erreur ;
- retry borné ;
- possibilité de reprise manuelle contrôlée.

## 75. Sauvegardes et restauration

Toute restauration d’une sauvegarde doit exécuter une étape de réconciliation privacy avant remise en production.

Cette étape doit rejouer :

- suppressions ;
- retraits de consentement ;
- révocations ;
- legal holds ;
- politiques actives.

## 76. Documentation utilisateur

Les interfaces doivent expliquer simplement :

- quelles données principales sont utilisées ;
- pourquoi ;
- combien de temps lorsque pertinent ;
- comment exporter ;
- comment demander une suppression ;
- quelles données peuvent être conservées pour obligations légales.

## 77. Documentation organisation

Les clients professionnels doivent pouvoir obtenir une vue de :

- catégories traitées ;
- sous-traitants configurés ;
- rétention ;
- localisations ;
- exports ;
- suppressions ;
- incidents pertinents.

## 78. Critères d’acceptation

Le domaine est considéré prêt lorsque :

1. chaque catégorie sensible possède une politique de conservation ;
2. les consentements sont versionnés ;
3. les exports sont temporaires et sécurisés ;
4. les demandes de suppression sont traçables ;
5. les données sous obligation de conservation sont distinguées des données supprimables ;
6. les backups ne réintroduisent pas les données supprimées ;
7. les caches et index sont inclus dans le processus ;
8. les tests d’isolation multi-tenant passent ;
9. Jini Voice permet des durées de conservation courtes et l’export avant suppression ;
10. les données financières ne sont pas supprimées d’une manière qui casse le ledger ;
11. les données ANPR/RFID disposent de politiques dédiées ;
12. les logs ne contiennent pas de secrets ni de données sensibles inutiles ;
13. les modifications de rétention sont versionnées et auditables ;
14. un dry-run existe avant purge massive ;
15. l’administration peut prouver pourquoi une donnée est encore conservée.

## 79. Règle finale

La gouvernance des données Mansa doit être conçue comme une fonction technique centrale et non comme une simple page de politique de confidentialité.

Chaque produit doit intégrer dès sa conception :

```text
collecter le minimum
→ utiliser pour une finalité déclarée
→ protéger
→ limiter l’accès
→ conserver pendant une durée définie
→ exporter si nécessaire
→ supprimer, anonymiser ou archiver à échéance
→ conserver la preuve de l’opération
```

Aucune fonctionnalité future ne doit contourner cette chaîne pour des raisons de rapidité de développement ou de confort opérationnel.
