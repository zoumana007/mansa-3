# Sécurité — Gestion des clés, KMS/HSM, secrets et cryptographie Mansa

## 1. Objet

Ce document définit le cahier des charges transversal Mansa pour la gestion des clés cryptographiques, secrets applicatifs, certificats, signatures, chiffrement et matériels cryptographiques.

Il s'applique à tous les produits Mansa : API, applications mobiles, portails web, paiements, wallets, cartes, KYC/KYB, agents, commerce, secteur public, péages, télépéage, Jini, intégrations partenaires, environnements cloud et composants locaux/hors ligne.

L'objectif est qu'aucun secret sensible ni clé privée ne dépende du code source, d'un fichier Git, d'un poste développeur ou d'un accès humain unique.

## 2. Principes obligatoires

Les principes suivants sont non négociables :

- aucun secret de production dans Git, les images Docker, les bundles mobiles, les journaux ou la documentation ;
- séparation stricte des environnements `development`, `test`, `staging` et `production` ;
- clés distinctes par environnement, usage et niveau de sensibilité ;
- privilège minimal pour tout accès à une clé ou un secret ;
- rotation et révocation possibles sans redéployer manuellement tout le système ;
- audit de toute opération administrative sensible ;
- chiffrement des données sensibles au repos et en transit ;
- aucune clé privée de paiement ou de signature critique exportable en clair lorsqu'un KMS/HSM permet de l'éviter ;
- aucune valeur secrète dans les messages d'erreur ;
- aucune dépendance obligatoire à un seul fournisseur cloud.

## 3. Architecture cible

Architecture logique :

```text
Applications Mansa
        |
        v
Secret Manager / KMS abstraction
        |
        +--> Secret Manager cloud ou coffre local
        +--> KMS cloud
        +--> HSM certifié lorsque requis
        +--> PKI / gestion certificats
        +--> adaptateurs partenaires
```

Mansa doit exposer des interfaces internes afin que les services métier ne dépendent pas directement d'un fournisseur :

```text
SecretProvider
KeyManagementProvider
HsmProvider
CertificateProvider
SigningProvider
EncryptionProvider
TokenizationProvider
```

## 4. Classification des secrets

Chaque secret est classé au minimum selon les niveaux suivants :

```text
PUBLIC
INTERNAL
CONFIDENTIAL
HIGHLY_SENSITIVE
CRITICAL_CRYPTOGRAPHIC
```

Exemples :

- `PUBLIC` : identifiant public d'application ;
- `INTERNAL` : URL interne non sensible ;
- `CONFIDENTIAL` : mot de passe de service non financier ;
- `HIGHLY_SENSITIVE` : clé API partenaire, secret OAuth, mot de passe base de données ;
- `CRITICAL_CRYPTOGRAPHIC` : clé privée de signature, clé de chiffrement racine, clé de paiement, secret HMAC critique.

Les politiques d'accès, de rotation, de sauvegarde et d'export dépendent de cette classification.

## 5. Types de secrets à gérer

La plateforme doit gérer notamment :

- mots de passe de bases de données ;
- secrets JWT/HMAC ;
- clés privées et publiques ;
- certificats TLS/mTLS ;
- clés API partenaires ;
- secrets OAuth/OIDC ;
- secrets de webhooks ;
- identifiants Mobile Money ;
- identifiants d'acquéreurs et processeurs carte ;
- secrets de fournisseurs SMS/email/téléphonie ;
- secrets d'infrastructure ;
- secrets de CI/CD ;
- secrets de signature d'événements ;
- clés de chiffrement de données ;
- certificats de terminaux, bornes et contrôleurs ;
- secrets utilisés pour chiffrement local/hors ligne.

## 6. Secret Manager

Les secrets applicatifs doivent être récupérés à l'exécution depuis un gestionnaire de secrets approuvé.

Le système doit supporter :

- versioning ;
- rotation ;
- expiration ;
- révocation ;
- audit ;
- accès par identité machine ;
- renouvellement sans secret statique long terme lorsque possible ;
- cache mémoire court et contrôlé ;
- invalidation rapide du cache après rotation.

Les services ne doivent pas stocker durablement les secrets obtenus.

## 7. KMS

Les clés de chiffrement doivent être administrées via un KMS ou un système équivalent.

Le KMS doit permettre :

- création de clés ;
- activation/désactivation ;
- rotation ;
- versioning ;
- chiffrement/déchiffrement ;
- signature/vérification ;
- contrôle d'accès ;
- journalisation ;
- suppression différée et contrôlée ;
- séparation par environnement et domaine métier.

Mansa doit privilégier le chiffrement par enveloppe :

```text
KMS master key
   -> protège une Data Encryption Key (DEK)
   -> la DEK chiffre les données applicatives
   -> seule la DEK chiffrée est stockée avec les données
```

La clé maîtresse ne sort pas du KMS.

## 8. HSM

Un HSM doit être utilisé lorsque les exigences contractuelles, réglementaires, PCI, partenaires bancaires ou le niveau de risque l'imposent.

Cas possibles :

- clés de paiement ;
- clés PIN ;
- clés de personnalisation carte ;
- clés racines de signature ;
- opérations cryptographiques bancaires sensibles ;
- certificats ou signatures à très haut niveau de confiance.

Les opérations sensibles doivent s'exécuter dans le HSM lorsque le matériel le permet, sans exporter la clé privée.

Mansa ne doit pas prétendre qu'un composant logiciel standard remplace un HSM certifié lorsqu'une certification est exigée.

## 9. Séparation des clés par usage

Une même clé ne doit pas être réutilisée pour plusieurs fonctions incompatibles.

Exemples de domaines :

```text
AUTH_SIGNING
REFRESH_TOKEN_HASH
PII_ENCRYPTION
KYC_DOCUMENT_ENCRYPTION
PAYMENT_SIGNING
WEBHOOK_SIGNING
AUDIT_SIGNING
DEVICE_CERTIFICATE
OFFLINE_EVENT_SIGNING
DATABASE_BACKUP_ENCRYPTION
FILE_STORAGE_ENCRYPTION
```

Chaque domaine possède son cycle de vie et ses permissions.

## 10. Chiffrement des données sensibles

Les données sensibles doivent être protégées selon leur nature.

Exemples à chiffrer au niveau applicatif lorsque nécessaire :

- pièces KYC ;
- identifiants nationaux ;
- données bancaires sensibles non tokenisées ;
- secrets partenaires ;
- informations personnelles à risque élevé ;
- sauvegardes ;
- exports administratifs sensibles.

Le chiffrement disque/base de données fourni par l'infrastructure est utile mais ne remplace pas automatiquement le chiffrement applicatif des données à haut risque.

## 11. Données carte et tokenisation

Mansa doit minimiser autant que possible l'exposition aux données carte.

Lorsque l'acquéreur, le processeur ou un prestataire conforme fournit une tokenisation :

- Mansa stocke de préférence un token ;
- PAN complet, CVV/CVC et données de piste ne doivent pas être conservés inutilement ;
- le CVV/CVC ne doit jamais être journalisé ;
- les données interdites par les règles PCI applicables ne doivent pas être persistées après autorisation ;
- le périmètre PCI doit être réduit au strict nécessaire.

## 12. JWT et tokens applicatifs

Les clés de signature des tokens doivent :

- être séparées par environnement ;
- avoir une durée de vie et une politique de rotation définies ;
- supporter plusieurs versions pendant une période de transition ;
- publier uniquement les informations publiques nécessaires si une architecture asymétrique est utilisée ;
- permettre la révocation des sessions indépendamment de la clé lorsque le modèle l'exige.

Les nouveaux services doivent privilégier les algorithmes approuvés par la politique cryptographique Mansa et éviter tout algorithme obsolète.

## 13. Rotation

Chaque secret ou clé possède :

- date de création ;
- date d'activation ;
- dernière rotation ;
- prochaine rotation recommandée ou obligatoire ;
- propriétaire technique ;
- service consommateur ;
- niveau de criticité ;
- version active ;
- versions précédentes encore acceptées ;
- date de révocation.

La rotation doit pouvoir être progressive :

```text
CREATE_NEW
DUAL_ACCEPT
MIGRATE_USAGE
NEW_ONLY
REVOKE_OLD
DESTROY_WHEN_ALLOWED
```

Aucune rotation critique ne doit nécessiter une interruption globale de Mansa.

## 14. Révocation d'urgence

Le système doit supporter une révocation immédiate en cas de :

- secret exposé ;
- collaborateur compromis ;
- fournisseur compromis ;
- fuite Git ou CI ;
- terminal volé ;
- certificat compromis ;
- incident de cybersécurité.

Procédure minimale :

1. identifier le secret/la clé ;
2. désactiver ou révoquer ;
3. générer une nouvelle version ;
4. mettre à jour les consommateurs ;
5. invalider sessions/tokens dépendants si nécessaire ;
6. vérifier les journaux d'utilisation ;
7. ouvrir un incident de sécurité ;
8. documenter l'impact et la remédiation.

## 15. CI/CD

GitHub Actions et les agents de développement doivent utiliser des secrets gérés par la plateforme, jamais des secrets codés en dur.

Règles :

- permissions GitHub Actions minimales ;
- tokens à durée courte lorsque possible ;
- OIDC workload identity préféré aux clés cloud statiques ;
- aucun secret affiché dans les logs ;
- GitGuardian ou équivalent pour détecter les fuites ;
- un secret trouvé dans Git est considéré compromis même après suppression du fichier ;
- rotation obligatoire après exposition réelle.

## 16. Développement local

Les développeurs utilisent uniquement :

- valeurs fictives ;
- secrets de développement dédiés ;
- environnement local isolé ;
- fichiers locaux ignorés par Git ;
- outils de coffre local approuvés.

Aucun secret de production ne doit être requis pour exécuter les tests locaux.

## 17. Applications mobiles

Les applications mobiles sont considérées comme des environnements non fiables du point de vue du secret.

Il est interdit d'y embarquer :

- clé privée serveur ;
- secret d'acquéreur ;
- secret administrateur ;
- mot de passe backend ;
- secret permanent permettant de signer des opérations critiques.

Les clés propres à l'appareil doivent être stockées via les mécanismes sécurisés du système : Keychain/Secure Enclave côté iOS et Keystore/StrongBox lorsqu'ils sont disponibles côté Android.

## 18. Terminaux, TPE, bornes et contrôleurs locaux

Les appareils terrain peuvent recevoir une identité machine propre.

Chaque terminal doit idéalement posséder :

- `deviceId` unique ;
- certificat ou paire de clés dédiée ;
- statut ;
- date d'enrôlement ;
- date d'expiration certificat ;
- organisation/site associé ;
- capacité de révocation ;
- historique de rotation.

Une clé compromise sur une borne ne doit pas compromettre tout le réseau.

## 19. Péages et domaine État

Les principes de référence suivants restent obligatoires :

- coexistence du péage automatique classique avec barrière et du télépéage RFID avec barrière ;
- free-flow sans barrière uniquement comme évolution future optionnelle ;
- péage classique compatible, selon canaux activés, avec billets et pièces FCFA, EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money ;
- Mobile Money activable/désactivable administrativement au niveau national, réseau, poste ou voie avec date d'effet et audit ;
- télépéage initial par tags UHF RFID passifs associés à un véhicule et à un compte ;
- lecteur/antenne, contrôleur local, relais `OPEN`, barrière et capteurs de passage ;
- mode local/hors ligne sécurisé, resynchronisé et sans double débit ;
- terminal carte limité aux réseaux activés contractuellement par l'acquéreur, notamment Visa/Mastercard lorsqu'ils sont disponibles ;
- matériel multi-fournisseurs derrière adaptateurs ;
- voie automatique complète, voie semi-automatique et poste numérisé à faible coût ;
- déploiement progressif ;
- achat matériel par l'État/concessionnaire ou fourniture/intégration/revente par Mansa ;
- marque blanche État/concessionnaire possible, avec mention facultative `Propulsé par Mansa` ;
- rapprochement anti-corruption entre véhicule, catégorie, tarif, paiement, ouverture et passage physique ;
- toute ouverture manuelle auditée.

Pour ces équipements, les secrets des contrôleurs, certificats, API de caméras, lecteurs RFID et modules de paiement doivent être séparés par site/appareil lorsque possible.

## 20. Mode hors ligne sécurisé

Les composants hors ligne ne doivent conserver que les clés strictement nécessaires.

Exigences :

- clés locales distinctes par appareil/site ;
- stockage sécurisé matériel lorsque disponible ;
- durée de validité limitée ;
- compteur ou protection anti-rejeu ;
- journal local signé ou authentifié ;
- rotation lors de la reconnexion ;
- révocation d'un appareil perdu ;
- aucune clé racine globale stockée sur une borne.

## 21. Webhooks et intégrations partenaires

Les webhooks doivent être signés.

Le mécanisme doit prévoir :

- secret ou clé par partenaire ;
- timestamp ;
- nonce ou identifiant événement ;
- protection contre le replay ;
- signature sur le corps canonique ;
- rotation du secret ;
- période de double validation pendant rotation ;
- journalisation du résultat de vérification sans enregistrer le secret.

## 22. TLS et mTLS

Toute communication externe sensible utilise TLS.

mTLS peut être exigé pour :

- banques ;
- acquéreurs ;
- autorités publiques ;
- services internes sensibles ;
- équipements terrain ;
- fournisseurs imposant une authentification mutuelle.

Les certificats doivent être renouvelables automatiquement lorsque possible et surveillés avant expiration.

## 23. PKI interne

Si Mansa exploite une PKI interne, elle doit séparer :

- racine hors ligne ou fortement protégée ;
- autorité intermédiaire ;
- certificats serveurs ;
- certificats appareils ;
- certificats utilisateurs privilégiés si nécessaires.

La clé racine ne doit pas être utilisée pour signer directement tous les certificats opérationnels.

## 24. Accès humains

Les administrateurs sécurité ne doivent pas disposer automatiquement de la possibilité de lire tous les secrets en clair.

Le modèle doit supporter :

- RBAC ;
- MFA ;
- séparation des tâches ;
- approbation à deux personnes pour certaines opérations ;
- accès temporaire `just-in-time` ;
- justification ;
- journal d'audit ;
- révocation immédiate.

## 25. Break-glass

Un mécanisme d'accès d'urgence peut exister pour les incidents critiques.

Il doit :

- être exceptionnel ;
- exiger une forte authentification ;
- être limité dans le temps ;
- produire une alerte immédiate ;
- enregistrer toutes les actions ;
- déclencher une revue post-incident.

## 26. Journaux et audit

Les événements suivants doivent être journalisés :

```text
SECRET_CREATED
SECRET_READ
SECRET_ROTATED
SECRET_REVOKED
KEY_CREATED
KEY_USED
KEY_ROTATED
KEY_DISABLED
KEY_DELETION_REQUESTED
CERTIFICATE_ISSUED
CERTIFICATE_RENEWED
CERTIFICATE_REVOKED
ACCESS_DENIED
BREAK_GLASS_USED
```

Les journaux ne doivent jamais contenir la valeur du secret ni la clé privée.

## 27. Inventaire cryptographique

Mansa doit maintenir un inventaire central :

- identifiant ;
- type ;
- usage ;
- propriétaire ;
- environnement ;
- fournisseur ;
- emplacement logique ;
- algorithme ;
- taille de clé ;
- date de création ;
- date d'expiration ;
- dernière rotation ;
- consommateurs ;
- criticité ;
- statut.

Cet inventaire doit permettre d'identifier rapidement l'impact d'une vulnérabilité cryptographique ou d'un fournisseur compromis.

## 28. Politique cryptographique

Mansa doit maintenir une politique versionnée précisant :

- algorithmes autorisés ;
- algorithmes interdits ;
- tailles minimales ;
- protocoles TLS autorisés ;
- durées de vie ;
- exigences de rotation ;
- règles de signature ;
- règles de chiffrement ;
- règles de dérivation de clé ;
- stratégie de migration lorsqu'un algorithme devient obsolète.

Les choix cryptographiques ne doivent pas être inventés localement dans chaque module.

## 29. Sauvegardes

Les sauvegardes contenant des données sensibles doivent être chiffrées avec des clés distinctes des données de production lorsque pertinent.

La perte d'une clé de sauvegarde ne doit pas être possible sans procédure contrôlée de récupération, mais les sauvegardes ne doivent pas conserver indéfiniment des clés révoquées sans gouvernance.

Les procédures PRA/PCA doivent inclure la restauration de l'accès au KMS/HSM et aux secrets nécessaires.

## 30. Multi-région et souveraineté

L'emplacement des clés doit respecter :

- exigences réglementaires ;
- contraintes partenaires ;
- souveraineté des données ;
- architecture multi-pays ;
- stratégie de reprise après sinistre.

Une organisation ou un pays peut exiger que certaines clés restent dans une région ou infrastructure déterminée.

## 31. Haute disponibilité

Une panne du gestionnaire de clés ne doit pas provoquer des comportements financiers dangereux.

Le système doit définir :

- comportement fail-closed pour opérations sensibles ;
- cache sécurisé limité pour certains usages non critiques ;
- redondance du fournisseur ou du service ;
- procédures de reprise ;
- surveillance de latence et disponibilité ;
- mode dégradé explicite.

## 32. Modèle de données recommandé

Entités possibles :

```text
CryptographicAsset
SecretReference
KeyReference
KeyVersion
Certificate
CertificateAuthority
DeviceCredential
RotationPolicy
RotationEvent
RevocationEvent
SecretAccessAudit
BreakGlassSession
CryptoPolicy
ProviderConfiguration
```

Les valeurs secrètes ne sont pas stockées dans ces tables ; elles contiennent uniquement les références, métadonnées et statuts.

## 33. API internes

Exemples d'interfaces :

```text
getSecret(reference)
encrypt(keyRef, plaintext)
decrypt(keyRef, ciphertext)
sign(keyRef, payload)
verify(keyRef, payload, signature)
rotate(reference)
revoke(reference)
getActiveKeyVersion(reference)
issueDeviceCertificate(deviceId)
revokeDeviceCertificate(deviceId)
```

Les API doivent appliquer permissions, quotas et audit.

## 34. Tests obligatoires

Tests minimaux :

- secret absent du dépôt ;
- secret invalide ;
- clé désactivée ;
- clé expirée ;
- rotation avec ancienne et nouvelle version ;
- révocation immédiate ;
- service sans permission ;
- tentative inter-tenant ;
- certificat expiré ;
- certificat révoqué ;
- webhook replay ;
- signature invalide ;
- restauration après rotation ;
- perte de connexion KMS ;
- terminal compromis/révoqué ;
- mode hors ligne avec clé expirée.

## 35. CI et contrôles de sécurité

Les contrôles DevSecOps existants restent complémentaires :

- GitGuardian pour les secrets ;
- Snyk pour dépendances et composants ;
- Semgrep pour SAST ;
- revue de sécurité avant déploiement ;
- OWASP ZAP sur staging pour les surfaces HTTP.

Un scanner qui ne détecte rien ne constitue pas une preuve suffisante de sécurité cryptographique.

## 36. Alertes

Alertes prioritaires :

- secret consulté anormalement ;
- échecs répétés d'accès KMS ;
- expiration prochaine d'un certificat ;
- clé désactivée utilisée ;
- rotation échouée ;
- accès break-glass ;
- secret détecté dans Git ou CI ;
- usage depuis une identité inconnue ;
- appareil révoqué encore actif ;
- erreur HSM critique.

## 37. Administration

Le portail interne sécurité peut proposer :

```text
Sécurité
├── Inventaire cryptographique
├── Secrets (métadonnées uniquement)
├── Clés
├── Certificats
├── Appareils
├── Rotation
├── Révocations
├── Fournisseurs KMS/HSM
├── Politique cryptographique
├── Alertes
└── Audit
```

L'interface ne doit pas offrir par défaut un bouton permettant de révéler les secrets en clair.

## 38. Migration fournisseur

Mansa doit pouvoir migrer vers un autre fournisseur sans réécrire les services métier.

La stratégie doit supporter :

- double fournisseur temporaire ;
- nouvelle clé ;
- rechiffrement progressif ;
- versioning ;
- validation ;
- bascule ;
- retrait de l'ancien fournisseur.

## 39. Suppression et destruction

La destruction d'une clé doit être protégée par :

- autorisation forte ;
- confirmation ;
- délai de sécurité lorsque le fournisseur le permet ;
- analyse d'impact ;
- vérification des données encore dépendantes ;
- audit.

Une suppression accidentelle de clé ne doit pas être possible via une simple action non réversible.

## 40. Critères d'acceptation

Le module est considéré correctement cadré lorsque :

- aucun secret réel n'est stocké dans Git ;
- chaque secret/clé possède un propriétaire, un usage et un environnement ;
- les clés critiques sont non exportables lorsque requis ;
- rotation et révocation sont testées ;
- les services utilisent des identités machines et privilèges minimaux ;
- les terminaux disposent d'identités séparées ;
- l'audit ne contient jamais de valeur secrète ;
- les procédures d'urgence sont documentées ;
- la restauration PRA inclut les dépendances cryptographiques ;
- les exigences paiements, secteur public et équipements hors ligne sont couvertes ;
- l'architecture reste multi-fournisseurs.
