# Cahier des charges — Gestion cryptographique des clés, KMS/HSM et cycle de vie des secrets

## 1. Objet

Ce document définit les exigences Mansa relatives à la création, au stockage, à l’utilisation, à la rotation, à la révocation, à la sauvegarde, à la destruction et à l’audit des clés cryptographiques et secrets techniques.

L’objectif est de disposer d’un socle cryptographique central, traçable, multi-tenant et exploitable par les applications, API, services financiers, cartes, TPE, terminaux agents, bornes, contrôleurs locaux, partenaires et environnements d’exploitation sans exposer les clés sensibles au code applicatif ni aux dépôts Git.

Le système doit privilégier l’utilisation de services KMS et de HSM pour les usages sensibles. Les clés privées, clés de chiffrement maîtresses, clés de signature de production, clés de PIN, clés liées aux paiements carte et autres matériels cryptographiques critiques ne doivent jamais être stockés en clair dans les bases de données, fichiers de configuration ou journaux.

## 2. Principes directeurs

La gestion cryptographique Mansa doit respecter les principes suivants :

1. aucune clé de production ne doit être stockée dans Git ;
2. les applications ne doivent recevoir que les droits cryptographiques strictement nécessaires ;
3. les clés maîtresses doivent rester non exportables lorsque la technologie utilisée le permet ;
4. toute utilisation sensible d’une clé doit être auditée ;
5. les environnements développement, test, recette et production doivent utiliser des clés distinctes ;
6. les tenants, pays et partenaires doivent pouvoir être isolés cryptographiquement lorsque le risque l’exige ;
7. les algorithmes et tailles de clés doivent être configurables et maintenus selon les standards applicables ;
8. la rotation doit être possible sans interruption significative de service ;
9. la compromission d’une clé doit pouvoir déclencher une révocation et une migration contrôlée ;
10. le code métier ne doit pas dépendre directement d’un fabricant HSM ou d’un fournisseur cloud unique.

## 3. Périmètre

Le domaine couvre au minimum :

- chiffrement des données au repos ;
- chiffrement applicatif de champs sensibles ;
- signature de JWT et jetons techniques ;
- signature de webhooks ;
- signature de commandes et événements sensibles ;
- certificats TLS et mTLS ;
- clés API partenaires ;
- secrets OAuth/OIDC ;
- clés de tokenisation ;
- clés de hachage/HMAC ;
- clés de chiffrement des sauvegardes ;
- clés de chiffrement des fichiers exportés ;
- clés des terminaux et appareils ;
- clés des TPE et équipements de paiement ;
- clés des bornes, contrôleurs locaux et équipements hors ligne ;
- clés liées aux cartes et paiements lorsqu’elles relèvent du périmètre Mansa ;
- secrets d’intégration Mobile Money, banques, État et partenaires ;
- clés de signature de logiciels, artefacts et mises à jour ;
- certificats de dispositifs ;
- secrets de bases de données, caches, files et services internes.

## 4. Terminologie

```text
KMS = Key Management Service
HSM = Hardware Security Module
KEK = Key Encryption Key
DEK = Data Encryption Key
CMK = Customer/Master Key selon le fournisseur
Key Version = version d’une clé logique
Envelope Encryption = chiffrement d’une DEK par une KEK
Rotation = création et activation d’une nouvelle version
Revocation = interdiction d’utiliser une clé
Crypto Shredding = destruction de la clé rendant les données illisibles
Wrapping = chiffrement d’une clé par une autre clé
Unwrapping = déchiffrement contrôlé d’une clé enveloppée
mTLS = authentification TLS mutuelle
HMAC = code d’authentification fondé sur un hachage
```

## 5. Architecture de référence

Mansa doit exposer une couche d’abstraction cryptographique interne.

```text
Application / Service / Terminal
        ↓
Crypto Service / Key Broker
        ↓
Policy Engine + Audit
        ↓
KMS / HSM / Secret Manager
```

Le code métier ne doit pas appeler directement des fonctions propriétaires de HSM lorsqu’un adaptateur peut isoler cette dépendance.

Interfaces recommandées :

```text
encrypt()
decrypt()
sign()
verify()
mac()
verifyMac()
generateDataKey()
wrapKey()
unwrapKey()
getCertificate()
rotateKey()
revokeKey()
```

## 6. Classification des clés

Chaque clé doit être classée selon son niveau de sensibilité.

```text
PUBLIC
INTERNAL
SENSITIVE
HIGHLY_SENSITIVE
PAYMENT_CRITICAL
ROOT_OF_TRUST
```

Exemples :

- clé publique de vérification : `PUBLIC` ;
- secret webhook : `SENSITIVE` ;
- KEK applicative : `HIGHLY_SENSITIVE` ;
- clé de PIN ou clé de paiement spécialisée : `PAYMENT_CRITICAL` ;
- clé racine de signature d’appareils : `ROOT_OF_TRUST`.

## 7. Inventaire central des clés

Mansa doit conserver un registre logique des clés sans y stocker leur valeur secrète lorsqu’elles sont gérées par KMS/HSM.

Champs minimaux :

```text
id
alias
purpose
algorithm
keySize
provider
providerKeyId
hsmPartition
countryCode
organizationId
tenantId
environment
status
version
createdAt
activatedAt
rotatedAt
expiresAt
revokedAt
destroyedAt
ownerTeam
approver
rotationPolicyId
classification
exportPolicy
```

## 8. États du cycle de vie

```text
PENDING_CREATION
CREATED
PENDING_ACTIVATION
ACTIVE
ROTATING
DECRYPT_ONLY
VERIFY_ONLY
SUSPENDED
REVOKED
PENDING_DESTRUCTION
DESTROYED
COMPROMISED
```

Une clé révoquée ne doit plus signer ni chiffrer de nouvelles données.

Une ancienne version peut rester temporairement disponible en `DECRYPT_ONLY` ou `VERIFY_ONLY` pour permettre une migration progressive.

## 9. Séparation des environnements

Les environnements doivent être cryptographiquement séparés :

```text
LOCAL
DEVELOPMENT
TEST
STAGING
PREPRODUCTION
PRODUCTION
```

Une clé de production ne doit jamais être copiée dans un environnement inférieur.

Les données de test ne doivent pas nécessiter les clés réelles de production.

## 10. Isolation multi-pays et multi-tenant

Selon le risque et les obligations applicables, Mansa doit pouvoir séparer les clés par :

```text
COUNTRY
LEGAL_ENTITY
ORGANIZATION
TENANT
PARTNER
PRODUCT
DATA_CLASS
ENVIRONMENT
```

Une organisation ne doit jamais pouvoir demander le déchiffrement d’une donnée appartenant à un autre tenant sans autorisation explicite et auditée.

## 11. Modèle KEK / DEK

Pour le chiffrement de données volumineuses ou de champs applicatifs, Mansa doit privilégier l’envelope encryption.

Flux recommandé :

```text
KMS/HSM génère ou protège une KEK
        ↓
génération d’une DEK aléatoire
        ↓
donnée chiffrée avec la DEK
        ↓
DEK chiffrée/wrappée avec la KEK
        ↓
stockage : ciphertext + wrappedDEK + keyVersion
```

La DEK en clair ne doit rester en mémoire que le temps strictement nécessaire.

## 12. Chiffrement au repos

Le chiffrement infrastructurel doit couvrir au minimum :

- bases de données ;
- volumes ;
- snapshots ;
- sauvegardes ;
- stockage objet ;
- files persistantes ;
- journaux contenant des données sensibles ;
- exports temporaires ;
- archives.

Le chiffrement disque ne remplace pas le chiffrement applicatif lorsque la menace inclut un accès logique à la base.

## 13. Chiffrement applicatif de champs

Les champs sensibles pouvant nécessiter un chiffrement applicatif incluent :

- identifiants officiels ;
- documents KYC ;
- données personnelles à haut risque ;
- références bancaires sensibles ;
- jetons partenaires ;
- secrets d’intégration ;
- données biométriques lorsqu’elles sont autorisées ;
- secrets de récupération ;
- données techniques permettant une usurpation.

Les applications doivent stocker la version de clé utilisée afin de permettre la rotation.

## 14. Données qui ne doivent pas être réversibles

Lorsqu’une donnée ne doit jamais être récupérée en clair, utiliser un mécanisme non réversible adapté.

Exemples :

- mots de passe : fonction de dérivation de mot de passe adaptée ;
- refresh tokens : hash/HMAC selon l’architecture ;
- codes à usage unique après validation : suppression ou hash selon le besoin ;
- empreintes de secrets : HMAC ou hash sécurisé.

Le chiffrement réversible ne doit pas remplacer un hash lorsque le secret n’a aucune raison d’être relu.

## 15. Signature et vérification

Les clés de signature doivent être séparées des clés de chiffrement.

Usages :

- JWT ;
- webhooks ;
- événements critiques ;
- reçus ou attestations numériques lorsque requis ;
- fichiers d’export signés ;
- mises à jour logicielles ;
- certificats de terminaux ;
- commandes envoyées aux équipements.

## 16. JWT et jetons

Pour les jetons signés, le système doit :

- limiter explicitement les algorithmes acceptés ;
- utiliser `kid` ou identifiant de version lorsque plusieurs clés coexistent ;
- vérifier issuer et audience ;
- limiter la durée de vie ;
- pouvoir retirer une clé de signature compromise ;
- publier uniquement les clés publiques nécessaires lorsque la signature est asymétrique.

La rotation des clés JWT ne doit pas invalider brutalement tous les jetons valides sauf incident de sécurité.

## 17. HMAC et signatures de webhooks

Chaque partenaire peut disposer d’un secret distinct.

Le webhook doit inclure au minimum :

```text
timestamp
unique event id
payload digest/signature
signature version
```

La vérification doit prévenir les attaques de rejeu au moyen d’une fenêtre temporelle et de l’identifiant d’événement.

## 18. TLS et mTLS

Toutes les communications sensibles doivent utiliser TLS approprié.

mTLS doit pouvoir être imposé pour :

- partenaires financiers ;
- banques ;
- infrastructures État ;
- services inter-datacenters sensibles ;
- terminaux privilégiés ;
- contrôleurs de péage ;
- interfaces matérielles compatibles.

Les certificats doivent être inventoriés, renouvelés avant expiration et révocables.

## 19. PKI interne

Mansa peut exploiter une PKI interne ou un service managé pour les identités techniques.

Hiérarchie recommandée :

```text
Root CA hors ligne ou fortement protégée
        ↓
Intermediate CA par usage/environnement
        ↓
certificats services / appareils / terminaux
```

La clé racine ne doit pas être utilisée directement pour signer quotidiennement des certificats finaux.

## 20. Certificats de dispositifs

Chaque terminal sensible doit pouvoir recevoir une identité cryptographique unique.

Exemples :

- TPE ;
- terminal agent ;
- tablette État ;
- borne de péage ;
- contrôleur de voie ;
- caisse ;
- kiosque ;
- équipement d’accès ;
- serveur edge.

Le clonage d’un certificat d’un terminal vers un autre doit être interdit.

## 21. Provisioning des terminaux

Le provisioning doit utiliser un flux contrôlé :

1. enregistrement de l’équipement ;
2. vérification de série/identité ;
3. génération locale ou distante de paire de clés ;
4. émission de certificat ;
5. liaison à l’organisation et au site ;
6. activation ;
7. confirmation d’attestation si disponible ;
8. journalisation.

Les clés privées d’appareil doivent idéalement être générées dans un secure element, TPM, TEE ou HSM local lorsqu’il existe.

## 22. Terminaux TPE et paiements carte

Les usages cryptographiques liés au paiement carte doivent respecter le modèle de certification, le matériel et les partenaires acquéreurs réellement utilisés.

Mansa doit pouvoir intégrer des HSM spécialisés ou services de paiement certifiés derrière des adaptateurs.

Les clés de PIN, de dérivation, de traduction ou autres clés réglementées ne doivent pas être traitées comme de simples variables d’environnement.

Mansa ne doit pas inventer de mécanisme propriétaire lorsque les standards carte imposent un dispositif certifié.

## 23. Bornes de péage et contrôleurs locaux

Les bornes et contrôleurs de péage doivent disposer de clés ou certificats propres à l’équipement.

Ils doivent pouvoir :

- authentifier le backend Mansa ;
- signer ou authentifier les événements locaux ;
- vérifier l’authenticité des règles téléchargées ;
- protéger les journaux hors ligne ;
- vérifier les mises à jour logicielles ;
- sécuriser les commandes d’ouverture lorsque l’interface le permet ;
- détecter un terminal révoqué.

Les deux solutions initiales de péage restent compatibles avec ce modèle : péage automatique classique avec barrière et télépéage UHF RFID avec barrière. Une évolution free-flow ultérieure peut réutiliser la même infrastructure d’identité cryptographique sans remplacer ces deux solutions.

## 24. Fonctionnement hors ligne sécurisé

Les équipements autorisés à fonctionner hors ligne peuvent conserver un sous-ensemble minimal de clés opérationnelles.

Règles :

- aucune clé racine globale ne doit être distribuée à un terminal ;
- clés locales distinctes par appareil ou groupe contrôlé ;
- durée de validité limitée lorsque possible ;
- stockage matériel sécurisé ;
- compteur monotone ou protection anti-rejeu lorsque disponible ;
- journaux signés/MACés ;
- resynchronisation avec détection de duplication ;
- révocation récupérée dès le retour du réseau.

Le fonctionnement hors ligne ne doit pas permettre de contourner les contrôles de double débit, d’idempotence ou d’audit.

## 25. RFID UHF de télépéage

Les tags UHF RFID passifs utilisés pour le télépéage servent d’identifiant associé au véhicule et au compte selon l’architecture définie.

Mansa ne doit pas considérer un identifiant RFID lisible comme un secret suffisant pour autoriser à lui seul une opération financière irréversible.

La décision doit être renforcée par les données backend/locales autorisées, l’état du compte, les listes d’autorisation/blocage, les capteurs de passage et les contrôles de cohérence disponibles.

## 26. Secrets d’intégration partenaires

Les clés API, secrets OAuth, mots de passe techniques et certificats partenaires doivent être stockés dans un gestionnaire de secrets ou KMS adapté.

Chaque partenaire doit disposer de secrets dédiés.

Les secrets ne doivent pas être partagés entre :

- production et test ;
- plusieurs partenaires ;
- plusieurs pays sans justification ;
- services n’ayant pas le même besoin.

## 27. Accès aux clés

L’accès doit suivre le principe du moindre privilège.

Exemples de permissions :

```text
KEY_ENCRYPT
KEY_DECRYPT
KEY_SIGN
KEY_VERIFY
KEY_GENERATE_DATA_KEY
KEY_ROTATE
KEY_REVOKE
KEY_DESTROY
KEY_EXPORT_PUBLIC
KEY_ADMIN
```

Une application pouvant chiffrer n’a pas automatiquement besoin du droit de déchiffrer.

## 28. Séparation des rôles

Les opérations à fort impact doivent pouvoir nécessiter plusieurs rôles :

- demandeur ;
- approbateur sécurité ;
- opérateur HSM/KMS ;
- auditeur ;
- responsable métier lorsque nécessaire.

La même personne ne doit pas pouvoir créer, approuver et détruire seule une clé racine critique lorsque le mode double contrôle est activé.

## 29. Authentification administrative

Les actions KMS/HSM administratives exigent :

- authentification forte ;
- MFA résistante au phishing lorsque possible ;
- session courte ;
- accès depuis environnement administratif contrôlé ;
- journalisation ;
- justification pour les actions critiques.

## 30. Rotation automatique

Chaque type de clé doit avoir une politique de rotation.

Exemples :

```text
JWT_SIGNING_KEY
DATABASE_FIELD_KEK
WEBHOOK_SECRET
DEVICE_CA
DEVICE_CERTIFICATE
BACKUP_ENCRYPTION_KEY
PARTNER_API_SECRET
SOFTWARE_SIGNING_KEY
```

La fréquence dépend du niveau de risque, du standard applicable et des contraintes partenaires.

## 31. Rotation sans interruption

Le mécanisme doit supporter plusieurs versions simultanément.

Exemple :

```text
v3 ACTIVE -> chiffre/signe les nouvelles données
v2 DECRYPT_ONLY / VERIFY_ONLY -> lecture des données existantes
v1 RETIRED -> non utilisée
```

Le déchiffrement doit sélectionner la bonne version à partir des métadonnées stockées.

## 32. Rechiffrement progressif

Après rotation d’une KEK ou d’une clé applicative, Mansa doit pouvoir migrer les données :

- à la lecture ;
- en batch ;
- par file de migration ;
- par rewrapping de DEK sans rechiffrer tout le contenu lorsque possible.

La migration doit être idempotente et observable.

## 33. Rotation d’urgence

Un incident doit pouvoir déclencher :

1. classification de la clé compromise ;
2. suspension ou révocation ;
3. activation d’une nouvelle clé ;
4. propagation aux services ;
5. rotation des dépendances ;
6. invalidation des certificats ou secrets concernés ;
7. analyse des utilisations historiques ;
8. notification des partenaires si nécessaire ;
9. migration des données ;
10. rapport d’incident.

## 34. Révocation

La révocation doit être propagée rapidement.

Pour les appareils hors ligne, la prochaine synchronisation doit récupérer les listes de révocation ou politiques équivalentes.

Un terminal révoqué ne doit plus pouvoir recevoir de nouvelles autorisations sensibles.

## 35. Destruction

Une clé détruite ne doit pas pouvoir être restaurée, sauf mécanisme de sauvegarde explicitement prévu avant destruction.

La destruction définitive doit être protégée par :

- délai de sécurité ;
- double validation pour les clés critiques ;
- preuve d’impact ;
- vérification des dépendances ;
- journal d’audit immuable.

## 36. Crypto-shredding

Pour certains ensembles de données, la destruction contrôlée d’une clé dédiée peut servir de mécanisme de suppression cryptographique.

Cette méthode ne doit être utilisée que si :

- aucune copie en clair n’existe ;
- toutes les copies chiffrées dépendent effectivement de la clé ;
- les sauvegardes sont couvertes ;
- les obligations de conservation permettent la suppression ;
- l’impact est compris et validé.

## 37. Sauvegarde des clés

Les clés nécessitant une récupération doivent disposer d’un mécanisme de backup compatible avec leur classification.

Une clé HSM non exportable peut utiliser les mécanismes sécurisés de réplication ou de sauvegarde du fournisseur.

Les sauvegardes de clés doivent être séparées des sauvegardes de données.

## 38. Haute disponibilité HSM/KMS

Les services critiques doivent prévoir :

- redondance ;
- réplication contrôlée ;
- région ou zone secondaire lorsque nécessaire ;
- bascule testée ;
- monitoring de latence ;
- quotas ;
- protection contre saturation ;
- mode dégradé explicite.

Une panne KMS ne doit jamais entraîner un fallback vers des clés codées en dur.

## 39. Cache cryptographique

Un cache de DEK ou de clés publiques peut être utilisé pour performance uniquement lorsque le risque est maîtrisé.

Exigences :

- TTL court ;
- mémoire uniquement lorsque possible ;
- zéroisation après usage si supportée ;
- taille limitée ;
- aucun log ;
- invalidation lors de révocation ;
- métriques sans valeur secrète.

## 40. Résilience réseau

Les services doivent distinguer :

```text
KMS_UNAVAILABLE
KMS_TIMEOUT
KEY_DISABLED
KEY_NOT_FOUND
KEY_ACCESS_DENIED
KEY_VERSION_RETIRED
HSM_CAPACITY_EXCEEDED
```

Les retries doivent être bornés et ne pas transformer une panne KMS en tempête de requêtes.

## 41. Journaux d’audit

Événements minimum :

```text
KEY_CREATED
KEY_ACTIVATED
KEY_ROTATED
KEY_SUSPENDED
KEY_REVOKED
KEY_DESTROY_REQUESTED
KEY_DESTROYED
KEY_POLICY_CHANGED
KEY_PERMISSION_GRANTED
KEY_PERMISSION_REVOKED
DECRYPT_DENIED
SIGN_DENIED
CERTIFICATE_ISSUED
CERTIFICATE_REVOKED
SECRET_ACCESSED
SECRET_ROTATED
```

Les journaux ne doivent jamais contenir la valeur de la clé ou du secret.

## 42. Détection d’abus

Le système doit détecter :

- volume inhabituel de déchiffrements ;
- usage d’une clé par un nouveau service ;
- opérations hors horaires administratifs ;
- erreurs répétées d’autorisation ;
- tentative d’export d’une clé non exportable ;
- désactivation d’audit ;
- rotation anormalement fréquente ;
- utilisation d’une ancienne version après délai de migration.

Les événements critiques doivent alimenter le système de supervision et de fraude/sécurité.

## 43. Secrets dans les logs

Les bibliothèques de logging doivent masquer automatiquement :

- Authorization headers ;
- API keys ;
- tokens ;
- cookies de session ;
- secrets OAuth ;
- mots de passe ;
- material cryptographique ;
- valeurs de variables sensibles.

Un filtre de logs ne remplace pas l’interdiction d’exposer ces données au code inutilement.

## 44. Secrets dans les erreurs

Les exceptions, traces, pages de debug et rapports de crash ne doivent pas contenir de secrets.

Les erreurs destinées aux clients ne doivent jamais révéler :

- identifiant KMS interne ;
- partition HSM ;
- chemin de secret ;
- détails de politique cryptographique exploitables ;
- matériel cryptographique.

## 45. Secrets CI/CD

Les pipelines doivent utiliser les magasins de secrets de la plateforme ou une fédération d’identité courte durée.

Préférer :

```text
OIDC workload identity
short-lived credentials
dynamic secrets
scoped tokens
```

Éviter les secrets statiques longue durée lorsque des identités de workload sont disponibles.

## 46. Signature des artefacts

Les artefacts de production doivent pouvoir être signés :

- applications mobiles ;
- APK/TPE ;
- firmware ou paquet de borne ;
- images conteneur ;
- paquets internes ;
- fichiers de configuration critiques.

Les clés de signature doivent être distinctes des clés applicatives.

## 47. Mise à jour des bornes et terminaux

Avant installation d’une mise à jour, le terminal doit vérifier sa provenance et son intégrité.

Une mise à jour non signée ou signée par une clé révoquée doit être rejetée.

Le rollback vers une version vulnérable doit pouvoir être interdit par politique.

## 48. API du Crypto Service

Exemple logique :

```text
POST /crypto/encrypt
POST /crypto/decrypt
POST /crypto/sign
POST /crypto/verify
POST /crypto/data-keys
POST /crypto/wrap
POST /crypto/unwrap
```

Ces API ne doivent pas être exposées publiquement sans besoin explicite.

L’identité du workload appelant doit être vérifiée.

## 49. Contexte cryptographique

Les opérations de chiffrement doivent pouvoir intégrer un contexte authentifié.

Exemple :

```text
tenantId
countryCode
entityType
entityId
purpose
```

Ainsi, une donnée chiffrée pour un tenant ou usage donné ne doit pas être interchangeable silencieusement avec un autre contexte.

## 50. Idempotence des opérations administratives

Les requêtes de rotation, activation et révocation doivent être idempotentes afin d’éviter des états incohérents lors de retries.

Chaque demande sensible doit avoir un identifiant unique.

## 51. Algorithmes autorisés

Mansa doit maintenir une politique d’algorithmes autorisés et interdits.

Cette politique doit pouvoir évoluer sans refactor massif du métier.

Exigences :

- pas d’algorithme propriétaire ;
- pas de chiffrement obsolète pour de nouveaux usages ;
- modes authentifiés pour le chiffrement moderne lorsque pertinent ;
- tailles de clés conformes aux recommandations applicables ;
- compatibilité HSM/KMS vérifiée ;
- migration planifiée avant dépréciation.

## 52. Crypto-agilité

Les formats de données chiffrées doivent inclure les métadonnées nécessaires à une migration future.

Exemple :

```text
cipherVersion
algorithm
keyId
keyVersion
nonce/iv
ciphertext
authenticationTag
```

Les noms exacts dépendent de l’implémentation.

## 53. Préparation post-quantique

Mansa ne doit pas déployer prématurément des mécanismes non validés, mais l’architecture doit éviter de figer les formats et protocoles de manière empêchant une transition future vers des algorithmes post-quantiques standardisés.

Les données nécessitant une confidentialité sur très longue durée doivent être inventoriées.

## 54. Tokenisation

Lorsque la tokenisation est utilisée :

- le token ne doit pas révéler la valeur originale ;
- le mapping doit être protégé ;
- le service de tokenisation doit être isolé ;
- les permissions de detokenization doivent être plus strictes que celles de tokenization ;
- les logs ne doivent pas exposer les valeurs sources.

## 55. Données carte

Le PAN, les données sensibles d’authentification et autres éléments de paiement carte doivent être traités conformément au périmètre PCI et au rôle contractuel réel de Mansa.

Mansa doit réduire son exposition en utilisant tokenisation, prestataires certifiés et composants de paiement appropriés lorsque possible.

Les données interdites à conserver ne doivent jamais être stockées sous prétexte qu’elles sont chiffrées.

## 56. PIN et secrets de paiement

Les opérations PIN ou autres opérations cryptographiques carte spécialisées doivent être confiées à des composants/HSM conformes aux exigences applicables.

Aucun PIN en clair ne doit transiter dans les logs, bases ou API métier Mansa.

## 57. Mobile Money

Les secrets d’intégration Mobile Money doivent être distincts par opérateur et environnement.

L’activation ou désactivation du canal Mobile Money pour les péages ou autres services reste une politique métier de l’administration ; elle ne doit pas être couplée à la suppression des secrets ou du code d’intégration.

## 58. Banque et acquisition

Les certificats, clés API et secrets acquéreurs doivent être isolés par partenaire.

Le terminal carte doit accepter uniquement les réseaux réellement activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles. La gestion de clés ne doit jamais être utilisée pour prétendre qu’un terminal accepte toutes les cartes du monde.

## 59. État et administrations

Pour les services publics, Mansa doit pouvoir créer des domaines cryptographiques distincts pour :

- ministère ;
- agence ;
- collectivité ;
- concessionnaire ;
- service de recettes ;
- péage ;
- établissement public.

Le co-branding ou marque blanche ne modifie pas les exigences cryptographiques sous-jacentes.

## 60. Multi-fournisseurs matériels

Les équipements doivent rester multi-fournisseurs.

Les clés et certificats sont gérés via des adaptateurs selon les capacités réelles :

- secure element ;
- TPM ;
- TEE ;
- HSM embarqué ;
- keystore système ;
- module constructeur ;
- PKCS#11 ;
- API KMS ;
- interface industrielle documentée.

Aucun fabricant unique ne doit être imposé par l’architecture logique Mansa.

## 61. PKCS#11 et interfaces HSM

Lorsque pertinent, l’adaptateur HSM peut utiliser une interface standard telle que PKCS#11.

Le code métier ne doit pas manipuler directement les handles ou sessions HSM.

Le pooling, les timeouts et les erreurs HSM doivent être gérés dans la couche cryptographique.

## 62. Quotas HSM/KMS

Le système doit surveiller :

- opérations/seconde ;
- latence ;
- throttling ;
- erreurs ;
- saturation de sessions ;
- coûts ;
- disponibilité.

Les opérations de masse doivent utiliser envelope encryption plutôt qu’un appel HSM pour chaque octet de donnée.

## 63. Performance

Objectifs :

- ne pas ralentir inutilement les paiements ;
- ne pas exposer de clé pour gagner de la performance ;
- utiliser cache limité pour clés publiques et DEK autorisées ;
- batcher les opérations compatibles ;
- dimensionner HSM/KMS pour les pics.

## 64. Tests unitaires

Les tests doivent couvrir :

- sélection de version ;
- chiffrement/déchiffrement ;
- signature/vérification ;
- mauvaise clé ;
- mauvais contexte ;
- clé révoquée ;
- clé expirée ;
- permission refusée ;
- rotation ;
- migration ;
- erreurs KMS.

Les tests utilisent uniquement des clés fictives ou environnement de test.

## 65. Tests d’intégration

Prévoir :

- KMS sandbox ;
- HSM de test ou simulateur autorisé ;
- rotation réelle d’une clé de test ;
- révocation ;
- bascule de version ;
- reprise après indisponibilité ;
- certificat terminal ;
- mTLS ;
- signature d’artefact.

## 66. Tests de panne

Scénarios :

```text
KMS indisponible
HSM saturé
certificat expiré
clé désactivée
version inconnue
latence élevée
perte réseau terminal
rotation pendant transaction
révocation pendant session
```

Le comportement doit être déterministe et sécurisé.

## 67. Tests de sécurité

Les revues doivent rechercher :

- secrets hardcodés ;
- clés dans Git ;
- clés dans logs ;
- chiffrement maison ;
- IV/nonce réutilisé ;
- mauvais contrôle d’accès KMS ;
- clé partagée entre tenants ;
- algorithme faible ;
- validation TLS désactivée ;
- certificat accepté sans vérification ;
- fonction de déchiffrement trop largement accessible.

## 68. CI sécurité

Les contrôles automatisés doivent inclure :

- secret scanning ;
- SAST ;
- audit dépendances cryptographiques ;
- règles interdisant certains patterns ;
- vérification des permissions IaC ;
- détection de certificats ou clés privées commitées.

Une clé détectée dans Git doit être considérée compromise jusqu’à preuve contraire et rotée si nécessaire.

## 69. Infrastructure as Code

Les ressources KMS/HSM doivent être définies de manière reproductible lorsque possible.

L’IaC peut définir :

- alias ;
- politiques ;
- réplication ;
- rotation ;
- logging ;
- réseau ;
- sauvegarde.

L’IaC ne contient jamais la valeur des secrets.

## 70. Déploiement progressif

Le module doit être déployé progressivement :

1. inventaire des secrets existants ;
2. suppression des secrets Git ;
3. centralisation Secret Manager ;
4. mise en place KMS ;
5. envelope encryption ;
6. certificats de services ;
7. certificats de dispositifs ;
8. HSM spécialisé pour usages requis ;
9. automatisation rotation ;
10. durcissement et audits réguliers.

Les services ne doivent pas être migrés tous simultanément si cela augmente le risque opérationnel.

## 71. Migration de secrets existants

Pour un secret historique :

1. identifier les consommateurs ;
2. créer le nouveau secret dans le store sécurisé ;
3. modifier les workloads pour le récupérer dynamiquement ;
4. tester ;
5. activer ;
6. révoquer l’ancien ;
7. supprimer toute copie locale ;
8. vérifier l’historique Git ;
9. auditer.

## 72. Réponse à fuite Git

Si un secret réel est commité :

- ne pas se contenter de supprimer le fichier ;
- révoquer ou faire tourner le secret ;
- rechercher les usages ;
- vérifier les logs d’accès ;
- nettoyer l’historique si nécessaire ;
- documenter l’incident ;
- renforcer le secret scanning.

## 73. Accès développeur

Les développeurs ne doivent pas disposer par défaut des clés de production.

L’accès exceptionnel doit être :

- temporaire ;
- justifié ;
- approuvé ;
- fortement authentifié ;
- journalisé.

Les outils locaux utilisent des clés de développement isolées.

## 74. Break-glass

Un accès d’urgence peut être prévu pour incident critique.

Il doit :

- être désactivé par défaut ou fortement protégé ;
- nécessiter plusieurs contrôles ;
- générer une alerte immédiate ;
- expirer rapidement ;
- être revu après utilisation.

## 75. Tableaux de bord

Indicateurs :

- clés actives ;
- clés proches expiration ;
- rotations en retard ;
- certificats proches expiration ;
- erreurs KMS ;
- latence HSM ;
- accès refusés ;
- secrets non rotés ;
- appareils révoqués ;
- utilisation d’anciennes versions.

Aucune métrique ne contient de matériel secret.

## 76. Alertes

Alertes critiques :

- clé désactivée en production ;
- clé racine modifiée ;
- tentative d’export ;
- secret révélé dans un scan ;
- certificat critique expirant ;
- hausse massive des decrypt ;
- changement de politique KMS ;
- destruction demandée ;
- HSM indisponible ;
- terminal révoqué encore actif.

## 77. Conservation des audits

Les audits cryptographiques doivent respecter la politique de rétention Mansa et les obligations applicables.

Ils doivent permettre de répondre :

```text
qui a créé la clé ?
qui l’a activée ?
quel service l’a utilisée ?
quand a-t-elle été tournée ?
quand a-t-elle été révoquée ?
quels objets dépendent de sa version ?
```

## 78. Documentation opérationnelle

Chaque catégorie de clé critique doit avoir un runbook :

- création ;
- activation ;
- rotation ;
- panne ;
- révocation ;
- compromission ;
- destruction ;
- restauration autorisée.

Les runbooks ne contiennent pas les secrets.

## 79. Gouvernance

Responsabilités minimales :

```text
Security / Cryptography Owner
Platform Owner
Payment Security Owner
Device Security Owner
Compliance
SRE
Application Owner
Auditor
```

Les responsabilités peuvent être regroupées dans une petite équipe au début, mais les contrôles critiques doivent rester séparables.

## 80. Critères d’acceptation

Le module est acceptable lorsque :

- aucune clé de production n’est stockée dans Git ;
- un inventaire complet des clés existe ;
- les clés maîtresses critiques sont protégées par KMS/HSM approprié ;
- l’envelope encryption est disponible pour les données applicatives ;
- la rotation fonctionne avec plusieurs versions ;
- les permissions sont basées sur les workloads ;
- les accès administratifs sont audités ;
- les terminaux sensibles peuvent recevoir une identité cryptographique unique ;
- les équipements hors ligne disposent de clés locales bornées et révocables ;
- les secrets partenaires sont isolés ;
- les certificats sont renouvelables automatiquement lorsque possible ;
- un scénario de compromission et rotation d’urgence a été testé ;
- les tests empêchent la régression vers du secret hardcodé.

## 81. Priorités d’implémentation

### P0

- Secret Manager ;
- KMS de production ;
- séparation environnements ;
- chiffrement applicatif des champs critiques ;
- rotation de clés ;
- permissions workload ;
- audit ;
- secret scanning ;
- clés de signature ;
- certificats TLS/mTLS principaux.

### P1

- PKI appareils ;
- certificats TPE/terminaux/bornes ;
- envelope encryption généralisée ;
- rotation automatisée partenaires ;
- rewrapping batch ;
- dashboards et alertes avancés.

### P2

- HSM multi-site avancé ;
- crypto-shredding par domaine ;
- automatisation complète du cycle de vie ;
- crypto-agilité renforcée ;
- préparation aux migrations algorithmiques futures.

## 82. Résultat attendu

Mansa doit disposer d’une infrastructure cryptographique où les applications consomment des capacités de chiffrement, signature et authentification sans posséder les clés maîtresses.

Le modèle doit protéger les services financiers, cartes, wallets, partenaires, API, données KYC, appareils, TPE, bornes et opérations État tout en restant multi-fournisseurs, auditable, rotatable, compatible hors ligne lorsque nécessaire et exploitable à grande échelle.

La compromission d’un composant ne doit pas entraîner automatiquement la compromission de toutes les clés Mansa : l’isolation par usage, environnement, tenant, appareil et niveau de sensibilité constitue une exigence fondamentale.