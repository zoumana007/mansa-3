# Mansa — Gouvernance des données, confidentialité, consentement et cycle de vie

## 1. Objet

Ce document définit le cadre transversal Mansa pour la gouvernance des données, la confidentialité, la conservation, l’export, la suppression, l’anonymisation, le consentement et la traçabilité des traitements.

Il s’applique à l’ensemble de l’écosystème Mansa :

- application client ;
- application commerçant ;
- application agent ;
- application TPE ;
- portail administrateur ;
- portail État ;
- Hub / annuaire ;
- Jini et Jini Voice ;
- paiements, wallets, ledger et cartes ;
- KYC/KYB ;
- support et réclamations ;
- analytics ;
- accès, mobilité, péages, RFID et ANPR ;
- partenaires, API et intégrations ;
- journaux techniques et de sécurité.

L’objectif est de garantir que chaque donnée possède une finalité, un propriétaire, une durée de conservation, une base de traitement, des règles d’accès et une stratégie de fin de vie explicites.

## 2. Principes directeurs

Mansa doit appliquer les principes suivants :

```text
DATA_MINIMIZATION
PURPOSE_LIMITATION
LEAST_PRIVILEGE
NEED_TO_KNOW
RETENTION_BY_POLICY
PRIVACY_BY_DESIGN
PRIVACY_BY_DEFAULT
AUDITABILITY
TENANT_ISOLATION
DATA_LOCALITY_WHEN_REQUIRED
REVERSIBLE_CONFIGURATION
NO_SILENT_RETROACTIVITY
```

Une donnée ne doit pas être collectée simplement parce qu’elle pourrait être utile plus tard.

Toute collecte doit répondre à une finalité métier, réglementaire, contractuelle, antifraude, sécurité ou support clairement définie.

## 3. Classification des données

Mansa doit classifier les données au minimum selon les niveaux suivants :

```text
PUBLIC
INTERNAL
CONFIDENTIAL
SENSITIVE
HIGHLY_SENSITIVE
REGULATED
```

Exemples :

- contenu public d’un mini-site commerçant : `PUBLIC` ;
- configuration interne : `INTERNAL` ;
- historique de transactions : `CONFIDENTIAL` ou `REGULATED` ;
- pièce KYC : `HIGHLY_SENSITIVE` ;
- secret d’API : `HIGHLY_SENSITIVE` ;
- données biométriques si un jour utilisées : `REGULATED` et traitement spécifique obligatoire ;
- positions et historiques de passage : `SENSITIVE` ;
- données ANPR et plaques : `SENSITIVE` ;
- enregistrements ou transcriptions Jini Voice : `SENSITIVE` voire `HIGHLY_SENSITIVE` selon contenu.

## 4. Catalogue de données

Chaque domaine doit être référencé dans un catalogue de données avec :

- nom du dataset ;
- domaine ;
- propriétaire métier ;
- propriétaire technique ;
- description ;
- classification ;
- finalité ;
- source ;
- destinataires ;
- pays/région de stockage si pertinent ;
- durée de conservation ;
- stratégie d’archivage ;
- stratégie de suppression ;
- règles d’anonymisation ;
- chiffrement requis ;
- rôles autorisés ;
- journalisation des accès ;
- base de traitement ou justification contractuelle/réglementaire applicable.

## 5. Data Ownership

Chaque type de donnée doit avoir un propriétaire clairement identifié.

Exemples :

```text
IdentityDataOwner
PaymentDataOwner
LedgerDataOwner
KycDataOwner
RiskDataOwner
StateServiceDataOwner
MobilityDataOwner
SupportDataOwner
VoiceDataOwner
AnalyticsDataOwner
SecurityLogDataOwner
```

Le propriétaire définit les règles métier. L’équipe plateforme applique les contrôles techniques. Aucun développeur ou administrateur ne doit pouvoir changer seul une règle de conservation sensible sans autorisation et audit.

## 6. Isolation multi-tenant

Toutes les données organisationnelles doivent être isolées par tenant.

Un tenant peut être :

- utilisateur individuel ;
- commerçant ;
- entreprise ;
- administration ;
- ministère ;
- agence publique ;
- concessionnaire ;
- banque ;
- partenaire ;
- réseau d’agents.

Les requêtes doivent imposer explicitement le contexte tenant. Une simple possession d’un identifiant de ressource ne doit jamais suffire pour accéder à une donnée d’un autre tenant.

Des tests négatifs d’autorisation doivent vérifier cette isolation.

## 7. Finalités de traitement

Chaque donnée doit être associée à une ou plusieurs finalités versionnées.

Exemples :

```text
ACCOUNT_OPERATION
PAYMENT_PROCESSING
KYC_VERIFICATION
FRAUD_PREVENTION
CUSTOMER_SUPPORT
LEGAL_COMPLIANCE
ACCOUNTING
SECURITY_MONITORING
SERVICE_PERSONALIZATION
MARKETING_WITH_CONSENT
MOBILITY_ACCESS_CONTROL
TOLL_OPERATION
VOICE_ASSISTANT_OPERATION
ANALYTICS_AGGREGATED
```

Une donnée collectée pour `KYC_VERIFICATION` ne doit pas être réutilisée automatiquement pour du marketing.

## 8. Consentement

Le moteur de consentement doit permettre :

- consentement explicite ;
- refus ;
- retrait ;
- consentement partiel ;
- consentement par finalité ;
- consentement par canal ;
- consentement par organisation ;
- version des conditions ;
- date et heure ;
- pays/région ;
- source de l’action ;
- preuve du consentement ;
- retrait ultérieur sans suppression automatique des données qui doivent légalement rester conservées.

États recommandés :

```text
GRANTED
DENIED
WITHDRAWN
EXPIRED
SUPERSEDED
NOT_REQUIRED
```

## 9. Consentement marketing

Le marketing doit rester séparé des fonctions nécessaires au service.

Exemples de canaux :

```text
PUSH
SMS
EMAIL
WHATSAPP
IN_APP
PHONE
```

Un utilisateur peut accepter les notifications de sécurité et refuser les communications promotionnelles.

Le retrait du marketing ne doit jamais casser les alertes transactionnelles ou de sécurité nécessaires.

## 10. Conservation par politique

Aucune durée de conservation globale unique ne doit être codée en dur.

Le moteur doit gérer des politiques par :

- pays ;
- type de donnée ;
- tenant ;
- produit ;
- finalité ;
- statut du compte ;
- événement déclencheur ;
- obligation contractuelle ou réglementaire ;
- litige en cours ;
- enquête fraude/sécurité.

Exemple de modèle :

```text
RetentionPolicy
- id
- dataset
- jurisdiction
- tenantType
- trigger
- activeDuration
- archiveDuration
- deletionMode
- legalHoldEligible
- version
- effectiveFrom
- approvedBy
```

## 11. Déclencheurs de conservation

Exemples :

```text
FROM_CREATION
FROM_LAST_ACTIVITY
FROM_TRANSACTION_SETTLEMENT
FROM_ACCOUNT_CLOSURE
FROM_KYC_EXPIRY
FROM_CONTRACT_END
FROM_CASE_CLOSURE
FROM_INCIDENT_CLOSURE
FROM_DEVICE_UNLINK
FROM_SUBSCRIPTION_END
```

La durée exacte doit être définie selon le cadre juridique et opérationnel applicable et rester configurable.

## 12. Legal hold / gel de suppression

Mansa doit pouvoir suspendre la suppression d’un ensemble de données lorsqu’un motif légitime l’exige.

Exemples :

- litige ;
- réclamation ;
- enquête fraude ;
- enquête sécurité ;
- demande d’une autorité compétente ;
- procédure judiciaire ;
- audit réglementaire.

États :

```text
ACTIVE
RELEASED
EXPIRED
CANCELLED
```

Un legal hold doit enregistrer :

- motif ;
- périmètre ;
- auteur ;
- approbateur ;
- date ;
- date de fin éventuelle ;
- références justificatives ;
- journal des consultations.

## 13. Suppression

La suppression doit distinguer :

```text
SOFT_DELETE
HARD_DELETE
CRYPTO_ERASURE
ANONYMIZE
PSEUDONYMIZE
ARCHIVE_RESTRICTED
```

Le choix dépend de la donnée et de la politique applicable.

Une simple suppression de l’interface utilisateur ne doit jamais être présentée comme une suppression définitive si la donnée reste dans les systèmes.

## 14. Suppression de compte

Lorsqu’un utilisateur demande la fermeture ou suppression de son compte, Mansa doit :

1. vérifier l’identité et l’autorisation ;
2. identifier les services actifs ;
3. bloquer les nouvelles opérations incompatibles avec la fermeture ;
4. traiter les soldes ou obligations en cours ;
5. identifier les données pouvant être supprimées immédiatement ;
6. identifier celles devant être conservées ;
7. appliquer anonymisation ou restriction lorsque pertinent ;
8. révoquer sessions et appareils ;
9. planifier la suppression différée ;
10. produire une preuve/audit de l’opération.

## 15. Export utilisateur

Le système doit permettre l’export des données lorsque le produit ou le cadre applicable le prévoit.

Formats recommandés :

```text
JSON
CSV
PDF pour synthèses lisibles
ZIP chiffré pour exports complexes
```

L’export doit :

- être préparé côté serveur ;
- exiger une authentification récente ;
- expirer après une durée courte ;
- utiliser une URL signée ou canal sécurisé ;
- ne jamais inclure les secrets internes ;
- ne jamais exposer les données d’un autre tenant ;
- être audité.

## 16. Portabilité et export local pour Jini / Jini Voice

Lorsque des données conversationnelles ou professionnelles sont supprimées rapidement du cloud Mansa, l’utilisateur ou l’organisation doit pouvoir exporter les données autorisées avant suppression vers son propre stockage.

Le système doit permettre des politiques telles que :

```text
NO_EXPORT
USER_EXPORT_ALLOWED
ORG_EXPORT_ALLOWED
AUTO_EXPORT_TO_CUSTOMER_STORAGE
EXPORT_BEFORE_DELETE
```

Les données exportées vers un stockage contrôlé par le client ne doivent plus être considérées comme détenues par Mansa après transfert confirmé, sauf copie obligatoire distincte.

## 17. Jini et données conversationnelles

Les conversations Jini et Jini Voice doivent appliquer une minimisation renforcée.

Le moteur doit distinguer :

- contenu brut ;
- transcription ;
- résumé ;
- intention détectée ;
- métadonnées techniques ;
- action métier produite ;
- preuve/audit ;
- donnée temporaire de traitement.

Une politique peut supprimer rapidement le contenu brut tout en conservant uniquement une trace minimale de l’action exécutée.

La conservation ne doit pas être implicitement infinie.

## 18. ANPR, RFID et mobilité

Les historiques de déplacement sont sensibles.

Pour le domaine accès/mobilité/péage :

- les images ANPR doivent avoir une durée de conservation configurable ;
- la plaque normalisée peut être conservée selon finalité opérationnelle, antifraude ou obligation applicable ;
- le RFID identifie le véhicule sans devoir stocker inutilement plus de données dans le tag ;
- les événements de passage doivent être séparés des images brutes ;
- les opérateurs ne voient que les données nécessaires à leur rôle ;
- les recherches massives de déplacements doivent être réservées à des rôles explicitement autorisés ;
- toute consultation sensible doit être auditée.

## 19. Référence péage et domaine État

Pour tout traitement de données lié aux péages, Mansa conserve les architectures de référence suivantes :

- solution A : péage automatique classique avec barrière ;
- solution B : télépéage UHF RFID passif avec barrière ;
- évolution future optionnelle : free-flow sans barrière, sans remplacer les solutions A et B.

Le péage classique peut accepter selon configuration : billets et pièces FCFA/XOF, carte bancaire EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money.

Mobile Money reste activable ou désactivable par l’administration au niveau national, réseau, poste ou voie, avec date d’effet et audit.

Le matériel reste multi-fournisseurs derrière des adaptateurs et peut être acheté par l’État/concessionnaire ou fourni/intégré/revendu par Mansa.

Les trois niveaux d’équipement restent supportés : voie automatique complète, voie semi-automatique sécurisée et poste numérisé à faible coût.

Le déploiement doit pouvoir être progressif.

La personnalisation marque blanche État/concessionnaire doit être possible avec mention facultative `Propulsé par Mansa`.

L’anti-corruption exige le rapprochement entre véhicule détecté, catégorie, tarif attendu, paiement, ouverture de barrière et passage physique ; toute ouverture manuelle reste auditée.

## 20. Paiements et ledger

Les données du ledger et des transactions financières ne doivent pas être modifiables ou supprimables comme de simples données applicatives.

Les corrections financières doivent utiliser :

- contre-écriture ;
- reversal ;
- adjustment audité ;
- transaction compensatrice.

La suppression d’un compte ne doit pas casser l’intégrité comptable.

Lorsque cela est permis, l’identité visible peut être pseudonymisée tout en conservant l’intégrité financière nécessaire.

## 21. KYC/KYB

Les documents KYC/KYB doivent :

- être chiffrés ;
- avoir des permissions séparées ;
- ne pas apparaître dans les logs ;
- ne pas être copiés vers les environnements de développement ;
- être masqués dans les interfaces non autorisées ;
- être protégés par des durées de conservation explicites ;
- être supprimés ou archivés selon politique après expiration ;
- conserver uniquement les métadonnées nécessaires lorsque le document brut n’est plus requis.

## 22. Données de développement et test

La production ne doit pas être copiée directement dans les environnements de développement ou de démonstration.

Les environnements non production utilisent :

- données synthétiques ;
- données fictives ;
- jeux anonymisés ;
- données masquées ;
- secrets séparés.

Toute extraction exceptionnelle de données réelles doit suivre une procédure autorisée et auditée.

## 23. Analytics

Les analytics doivent privilégier :

- agrégation ;
- pseudonymisation ;
- minimisation ;
- suppression des identifiants directs lorsque non nécessaires ;
- séparation analytics opérationnel / marketing ;
- consentement lorsque requis.

Les tableaux de bord statistiques doivent éviter de rendre identifiable une personne par combinaison de petits groupes.

## 24. Logs techniques

Les logs ne doivent jamais contenir en clair :

- mots de passe ;
- PIN ;
- CVV ;
- clés privées ;
- tokens complets ;
- secrets d’API ;
- documents KYC bruts ;
- données biométriques brutes ;
- contenu sensible non nécessaire.

Les identifiants techniques peuvent être pseudonymisés ou partiellement masqués.

## 25. Logs de sécurité

Les logs de sécurité doivent être protégés contre l’altération et avoir des politiques distinctes des logs applicatifs.

Ils peuvent inclure :

- connexions ;
- échecs d’authentification ;
- changements de rôles ;
- changements de politiques ;
- actions privilégiées ;
- exports ;
- suppressions ;
- legal holds ;
- incidents ;
- accès à des données hautement sensibles.

Ils doivent alimenter le SIEM/SOC selon la stratégie sécurité Mansa.

## 26. Chiffrement

Les données sensibles doivent être protégées :

- en transit ;
- au repos ;
- dans les sauvegardes ;
- dans les exports temporaires ;
- dans les files de messages lorsque nécessaire.

La gestion des clés suit le cahier des charges KMS/HSM Mansa.

Les clés et secrets ne doivent jamais être stockés dans Git.

## 27. Masquage dans les interfaces

Les interfaces doivent masquer les données sensibles selon rôle.

Exemples :

```text
+223 ** ** ** 42
**** **** **** 1234
z***@example.com
ID document: ******8392
```

Un rôle support peut voir une partie de la donnée sans disposer du droit de la révéler entièrement.

## 28. Accès privilégié

Les administrateurs privilégiés doivent utiliser :

- MFA renforcé ;
- session courte ;
- justification pour certaines consultations ;
- audit ;
- principe du moindre privilège ;
- séparation des tâches ;
- élévation temporaire lorsque possible.

L’accès administrateur à la plateforme ne signifie pas automatiquement accès à toutes les données personnelles.

## 29. Data Subject / Privacy Requests

Mansa doit pouvoir gérer des demandes telles que :

```text
ACCESS
EXPORT
CORRECTION
DELETION
RESTRICTION
CONSENT_WITHDRAWAL
OBJECTION
ACCOUNT_CLOSURE
```

Workflow recommandé :

```text
RECEIVED
IDENTITY_VERIFICATION
IN_REVIEW
PARTIALLY_FULFILLED
FULFILLED
REJECTED_WITH_REASON
CANCELLED
```

Chaque décision doit être justifiée et auditable.

## 30. Données partagées avec partenaires

Tout partage avec un partenaire doit définir :

- finalité ;
- périmètre ;
- champs transmis ;
- durée ;
- moyen de transport ;
- sécurité ;
- responsabilités ;
- suppression ;
- audit ;
- sous-traitants éventuels ;
- localisation si pertinente.

Une API ne doit jamais exposer plus de champs que nécessaire.

## 31. Webhooks

Les webhooks doivent :

- utiliser une signature ;
- permettre rotation des secrets ;
- éviter les données inutiles ;
- gérer idempotence et replay ;
- avoir une durée de rétention contrôlée pour les payloads ;
- masquer les données sensibles dans les logs.

## 32. Sauvegardes

La suppression logique de production ne garantit pas une disparition immédiate des sauvegardes.

Le processus doit définir :

- durée des sauvegardes ;
- chiffrement ;
- expiration automatique ;
- comportement d’une donnée supprimée lors d’une restauration ;
- mécanisme de re-suppression ou tombstone après restauration ;
- accès restreint.

Une restauration ne doit pas réactiver silencieusement des comptes ou consentements supprimés.

## 33. Tombstones

Pour certaines suppressions, une `DeletionTombstone` minimale peut être conservée afin d’éviter qu’une restauration ou resynchronisation ne recrée la donnée.

Elle ne doit contenir que le minimum nécessaire :

```text
resourceHash
resourceType
deletedAt
policyId
```

## 34. Synchronisation et offline

Les applications hors ligne doivent recevoir les informations de suppression et révocation.

Au retour du réseau :

- une resynchronisation ne doit pas recréer une donnée supprimée ;
- les anciens tokens doivent rester révoqués ;
- les événements offline doivent respecter la politique en vigueur ;
- les conflits doivent être audités.

## 35. Données sur appareils mobiles

Les applications doivent limiter le stockage local.

Les données sensibles locales doivent utiliser les mécanismes sécurisés du système : Keychain, Keystore ou équivalent.

Les caches doivent avoir :

- TTL ;
- chiffrement lorsque nécessaire ;
- effacement à la déconnexion selon politique ;
- effacement lors de révocation de l’appareil ;
- séparation entre profils/tenants.

## 36. Données des agents et commerçants

Les agents et commerçants ne doivent accéder qu’aux données nécessaires à leurs opérations.

Exemple : un agent de dépôt/retrait n’a pas besoin de voir l’intégralité du profil financier d’un client.

Les recherches par téléphone, identifiant ou QR doivent appliquer une limitation de fréquence et un masquage afin d’éviter l’énumération de comptes.

## 37. Portail État

Le portail État doit distinguer les données :

- de service public ;
- financières ;
- personnelles ;
- opérationnelles ;
- antifraude ;
- audit ;
- sécurité.

Une administration ne doit pas accéder aux données d’une autre administration sans base explicite et rôle autorisé.

Les recherches de masse sensibles doivent pouvoir nécessiter un rôle supérieur, une justification ou un double contrôle.

## 38. Paramétrage des politiques

Les politiques de données doivent être configurables depuis un portail sécurisé.

Chaque modification enregistre :

- ancienne valeur ;
- nouvelle valeur ;
- auteur ;
- approbateur si nécessaire ;
- date ;
- date d’effet ;
- motif ;
- version ;
- périmètre.

Une nouvelle politique ne doit pas modifier silencieusement les droits historiques ou obligations existantes.

## 39. Moteur de suppression

Architecture recommandée :

```text
Policy Engine
→ Eligibility Resolver
→ Legal Hold Check
→ Dependency Resolver
→ Anonymization / Deletion Worker
→ Backup Tombstone Registry
→ Audit Event
→ Completion Evidence
```

Le moteur doit être idempotent et reprenable après incident.

## 40. Modèle de données recommandé

Entités transversales :

```text
DataCatalogEntry
DataClassification
Purpose
Consent
ConsentVersion
RetentionPolicy
RetentionExecution
LegalHold
PrivacyRequest
DataExportJob
DeletionJob
DeletionTombstone
DataAccessAudit
DataSharingAgreement
AnonymizationPolicy
PrivacyIncident
```

## 41. Audit

Toute action sensible doit produire un événement d’audit contenant :

- acteur ;
- tenant ;
- rôle ;
- action ;
- ressource ;
- finalité ;
- horodatage ;
- résultat ;
- justification éventuelle ;
- corrélation de requête ;
- source ;
- politique appliquée.

L’audit ne doit pas contenir le contenu sensible complet.

## 42. Alertes

Le système peut alerter sur :

- export massif ;
- nombre inhabituel de consultations ;
- accès hors périmètre ;
- changement de politique ;
- suppression échouée ;
- données arrivées à expiration mais non traitées ;
- legal hold expiré ;
- export non téléchargé ;
- accès administrateur inhabituel.

## 43. Mesures de gouvernance

Indicateurs recommandés :

- datasets catalogués ;
- datasets sans propriétaire ;
- datasets sans politique de rétention ;
- données expirées en attente de purge ;
- délai moyen des demandes privacy ;
- suppressions réussies/échouées ;
- exports réalisés ;
- legal holds actifs ;
- accès privilégiés ;
- violations de politique ;
- volume de données anonymisées.

## 44. Incidents de confidentialité

Un incident relatif aux données doit s’intégrer au processus SOC/SIEM Mansa.

Le dossier doit pouvoir contenir :

- données concernées ;
- classification ;
- tenants affectés ;
- période ;
- cause ;
- accès observés ;
- actions de confinement ;
- actions correctives ;
- obligations de notification applicables ;
- preuves ;
- clôture.

## 45. Tests obligatoires

Les tests doivent couvrir au minimum :

- isolation multi-tenant ;
- retrait de consentement ;
- expiration d’une politique de rétention ;
- suppression idempotente ;
- legal hold empêchant une purge ;
- export limité au bon utilisateur ;
- anonymisation ;
- non-réapparition après restauration/synchronisation ;
- masquage des données ;
- permissions admin ;
- logs sans secrets ;
- révocation d’appareil et nettoyage local lorsque applicable.

## 46. Règles de développement

Codex et tout agent de développement doivent respecter les règles suivantes :

- ne jamais ajouter de secret dans le dépôt ;
- ne jamais utiliser des données personnelles réelles comme fixture par défaut ;
- ne jamais désactiver un contrôle de confidentialité pour faire passer un test ;
- ne jamais journaliser des payloads complets sans revue ;
- ajouter les tests négatifs d’accès ;
- utiliser les politiques plutôt que des durées codées en dur ;
- documenter toute nouvelle catégorie de donnée.

## 47. Critères d’acceptation

Le module est conforme lorsque :

- chaque domaine important possède une classification ;
- chaque donnée sensible possède une politique de conservation ;
- les consentements sont versionnés ;
- les exports sont sécurisés ;
- les suppressions sont auditables ;
- les legal holds sont respectés ;
- les données ne réapparaissent pas après restauration ;
- le multi-tenant est testé ;
- les secrets sont absents des logs et exports ;
- les opérations financières restent comptablement cohérentes ;
- les politiques peuvent évoluer sans modification de code métier dans les cas prévus.

## 48. Principe final

Mansa doit pouvoir répondre à quatre questions pour toute donnée :

```text
Pourquoi la détenons-nous ?
Qui peut y accéder ?
Combien de temps la conservons-nous ?
Que devient-elle à la fin de cette durée ?
```

Si l’une de ces réponses est inconnue, la donnée n’est pas correctement gouvernée.
