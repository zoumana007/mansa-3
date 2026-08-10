# Cahier des charges — Gestion de flotte, terminaux et équipements connectés

## 1. Objet

Ce document définit le domaine Mansa de gestion de flotte matérielle : terminaux de paiement, TPE Android, tablettes agents, bornes de péage, contrôleurs locaux, kiosques, imprimantes, scanners, lecteurs NFC, lecteurs RFID, périphériques cash, distributeurs, automates de dépôt et autres équipements autorisés.

Il complète les domaines déjà documentés de paiements, acquisition, TPE, commerce, agents, ATM, cash-in, cash-out, secteur public, péages, télépéage, sécurité, identité, observabilité, notifications et plateforme développeur. Il ne remplace aucun de ces domaines.

L’objectif est de fournir un socle central permettant d’inventorier, provisionner, configurer, superviser, mettre à jour, diagnostiquer, suspendre, remplacer et auditer les équipements Mansa ou intégrés à Mansa, tout en restant compatible avec plusieurs fabricants et plusieurs modèles commerciaux.

## 2. Périmètre

Le domaine couvre notamment :

- TPE Android dédiés au paiement ;
- smartphones ou tablettes d’agents ;
- terminaux commerçants ;
- bornes automatiques de péage ;
- postes semi-automatiques de péage ;
- postes numérisés à faible coût ;
- contrôleurs locaux de voie ;
- lecteurs UHF RFID ;
- caméras ou moteurs ANPR lorsque intégrés ;
- barrières et relais d’ouverture ;
- imprimantes tickets et reçus ;
- scanners QR et codes-barres ;
- lecteurs EMV/NFC ;
- PIN pads ;
- validateurs de billets ;
- monnayeurs ;
- recycleurs de billets ;
- hoppers pièces ;
- coffres intelligents ;
- distributeurs automatiques ;
- automates de dépôt ;
- kiosques administratifs ;
- afficheurs clients ;
- équipements de support ou diagnostic ;
- équipements fournis directement par l’État, un concessionnaire, une entreprise ou un partenaire lorsqu’une interface exploitable existe.

## 3. Principes directeurs

1. Le domaine métier ne doit dépendre d’aucun fabricant unique.
2. Chaque équipement doit avoir une identité technique durable distincte de son utilisateur courant.
3. Les secrets matériels, certificats et clés privées ne doivent jamais être stockés en clair dans Git, les logs ou les interfaces administratives.
4. Toute commande distante sensible doit être authentifiée, autorisée, signée ou protégée selon le canal utilisé, horodatée et auditée.
5. Une perte de connectivité ne doit pas rendre le matériel incohérent : le mode local autorisé doit rester explicite et borné.
6. Les politiques de mise à jour doivent supporter déploiement progressif, pause, reprise et rollback.
7. Un appareil compromis, perdu ou volé doit pouvoir être suspendu sans supprimer son historique.
8. Les capacités réelles d’un équipement doivent être découvertes ou déclarées, puis stockées ; l’interface ne doit pas promettre une fonctionnalité absente physiquement.
9. Le statut affiché dans Mansa doit distinguer l’état attendu, l’état remonté et l’état réellement vérifié.
10. Les équipements sensibles doivent être rattachés à une organisation, un site, une zone, une voie ou un point de service selon le contexte.
11. Aucun changement critique de configuration ne doit être silencieux.
12. L’administration centrale doit pouvoir définir des politiques globales tout en laissant des paramètres locaux autorisés.
13. Les journaux techniques ne doivent pas contenir de PAN complet, PIN, CVV, données biométriques brutes ou secret d’authentification.
14. Toute action financière reste contrôlée côté serveur ; un terminal n’est jamais l’unique source de vérité d’un paiement.
15. Les mécanismes de supervision doivent rester compatibles avec des réseaux intermittents ou coûteux.

## 4. Modèle fonctionnel

Entités recommandées :

```text
Device
DeviceModel
DeviceManufacturer
DeviceCapability
DeviceAssignment
DeviceEnrollment
DeviceCredential
DeviceCertificate
DeviceConfiguration
DeviceConfigurationVersion
DevicePolicy
DevicePolicyAssignment
DeviceHeartbeat
DeviceHealthSnapshot
DeviceMetric
DeviceEvent
DeviceCommand
DeviceCommandAttempt
DeviceSoftwarePackage
DeviceDeployment
DeviceDeploymentWave
DeviceIncident
DeviceMaintenance
DevicePeripheral
DevicePeripheralCapability
DeviceNetworkProfile
DeviceLocation
DeviceAuditEvent
```

Selon le produit, des spécialisations peuvent être ajoutées sans casser le modèle commun.

## 5. Identité d’un équipement

Un équipement doit disposer au minimum de :

```text
deviceId
organizationId
deviceType
manufacturer
model
serialNumber
hardwareRevision
firmwareVersion
softwareVersion
operatingSystem
countryCode
environment
status
createdAt
activatedAt
lastSeenAt
```

Les identifiants constructeur ne doivent pas être utilisés seuls comme clé métier globale.

## 6. Types d’équipements

Valeurs recommandées :

```text
POS_TERMINAL
ANDROID_TPE
AGENT_PHONE
AGENT_TABLET
MERCHANT_TERMINAL
TOLL_KIOSK
TOLL_LANE_CONTROLLER
RFID_READER
ANPR_CAMERA
BARRIER_CONTROLLER
EMV_READER
NFC_READER
PIN_PAD
QR_SCANNER
BARCODE_SCANNER
RECEIPT_PRINTER
BANKNOTE_ACCEPTOR
COIN_ACCEPTOR
BANKNOTE_RECYCLER
COIN_HOPPER
SMART_SAFE
ATM
CASH_DEPOSIT_MACHINE
PUBLIC_KIOSK
CUSTOM_DEVICE
```

Un même terminal peut exposer plusieurs périphériques ou capacités.

## 7. Capacités

Les capacités doivent être modélisées explicitement.

Exemples :

```text
EMV_CONTACT
EMV_CONTACTLESS
NFC_GENERIC
QR_DISPLAY
QR_SCAN
BARCODE_SCAN
PIN_ENTRY
RECEIPT_PRINT
CASH_ACCEPT
CASH_CHANGE
BANKNOTE_ACCEPT
COIN_ACCEPT
BANKNOTE_DISPENSE
COIN_DISPENSE
RFID_UHF_READ
ANPR_CAPTURE
RELAY_OPEN
OFFLINE_QUEUE
GPS
CAMERA
BIOMETRIC_SENSOR_IF_AUTHORIZED
REMOTE_UPDATE
REMOTE_DIAGNOSTIC
```

Une fonctionnalité ne doit être activée dans l’interface que si la capacité est disponible et autorisée par la politique.

## 8. Fabricants et modèles

`DeviceModel` doit décrire :

- fabricant ;
- référence commerciale ;
- catégorie ;
- système d’exploitation ;
- versions supportées ;
- capacités natives ;
- périphériques optionnels ;
- connectivité ;
- contraintes d’alimentation ;
- certification ou conformité applicable ;
- cycle de support ;
- date de fin de support si connue ;
- adaptateur Mansa compatible.

Le support d’un modèle doit être versionné et révocable.

## 9. Architecture multi-fournisseurs

Les intégrations matérielles doivent être isolées derrière des adaptateurs.

Exemples :

```text
PaymentTerminalAdapter
CashDeviceAdapter
RfidReaderAdapter
AnprAdapter
BarrierAdapter
PrinterAdapter
ScannerAdapter
DeviceManagementAdapter
```

Le cœur Mansa appelle des interfaces stables ; les SDK propriétaires restent confinés dans des modules d’intégration.

## 10. Modes de connexion

Un équipement peut être connecté par :

```text
HTTPS_API
WEBSOCKET
MQTT
SSE
PUSH_PROVIDER
VENDOR_MDM
VENDOR_CLOUD
SIP_OR_PBX_IF_RELEVANT
TCP_IP
USB
SERIAL_RS232
SERIAL_RS485
MDB
GPIO
RELAY_DRY_CONTACT
LOCAL_SDK
OTHER_DOCUMENTED_INTERFACE
```

Les protocoles industriels non chiffrés doivent être confinés au réseau local de confiance et protégés par l’architecture du site.

## 11. Enrôlement

Workflow recommandé :

```text
REGISTERED
PENDING_ENROLLMENT
CHALLENGE_ISSUED
VERIFIED
CREDENTIAL_PROVISIONED
CONFIGURED
ACTIVE
```

L’enrôlement peut combiner :

- code d’activation à usage unique ;
- QR d’installation ;
- certificat client ;
- attestation constructeur ;
- preuve de possession ;
- validation administrateur ;
- liaison à un site ou commerçant.

Un code d’activation expiré ou réutilisé doit être rejeté.

## 12. Identifiants et certificats

Les équipements sensibles doivent privilégier des identifiants spécifiques par appareil.

Principes :

- aucune clé partagée globale entre toute la flotte ;
- rotation possible ;
- révocation immédiate ;
- dates de validité ;
- stockage dans keystore sécurisé lorsque le matériel le permet ;
- certificat mTLS pour les catégories critiques lorsque pertinent ;
- séparation test, recette et production.

## 13. Affectation

Un équipement peut être affecté à :

```text
organization
merchant
agent
site
store
terminalGroup
tollNetwork
tollPlaza
tollLane
publicOffice
warehouse
vehicle
```

Toute réaffectation doit conserver :

- ancien propriétaire opérationnel ;
- nouvel affectataire ;
- auteur ;
- date ;
- motif ;
- éventuelle remise à zéro ;
- contrôle des données résiduelles.

## 14. États d’un équipement

États recommandés :

```text
INVENTORY
PENDING_ENROLLMENT
ACTIVE
DEGRADED
MAINTENANCE
SUSPENDED
LOST
STOLEN
COMPROMISED
RETIRED
DECOMMISSIONED
```

La suppression physique d’un appareil ne doit pas effacer son historique d’audit.

## 15. Heartbeat

Les équipements connectés doivent transmettre un heartbeat léger contenant uniquement les informations nécessaires.

Exemple :

```text
deviceId
timestamp
softwareVersion
firmwareVersion
batteryLevelIfRelevant
networkType
signalQuality
freeStorage
uptime
healthStatus
criticalPeripheralStates
```

La fréquence doit être configurable selon le type d’appareil et le coût réseau.

## 16. Santé matérielle

Le moteur doit pouvoir distinguer :

```text
HEALTHY
WARNING
DEGRADED
CRITICAL
OFFLINE
UNKNOWN
```

Un état `OFFLINE` doit dépendre d’un seuil et non d’une simple absence de heartbeat unique.

## 17. Périphériques

Pour une borne complexe, chaque périphérique doit être suivi séparément.

Exemple :

```text
kiosk
├── screen
├── emvReader
├── nfcReader
├── qrScanner
├── banknoteAcceptor
├── coinAcceptor
├── banknoteRecycler
├── coinHopper
├── receiptPrinter
├── rfidReader
├── anprCamera
└── barrierRelay
```

Une panne d’imprimante ne doit pas nécessairement rendre toute la borne indisponible.

## 18. Dégradation fonctionnelle

Le moteur de capacités doit recalculer les services disponibles selon les pannes.

Exemples :

- lecteur carte HS → carte désactivée ;
- validateur billets HS → billets désactivés ;
- hopper monnaie vide → paiement cash nécessitant rendu bloqué ou paiement exact imposé selon politique ;
- imprimante HS → reçu numérique privilégié si autorisé ;
- QR scanner HS → QR entrant désactivé ;
- RFID HS → voie télépéage bascule selon procédure prévue ;
- ANPR HS → passage possible uniquement selon règles de secours configurées.

L’usager doit être informé avant d’engager une opération incompatible.

## 19. Configuration

Une configuration doit être versionnée.

Exemple :

```text
configurationId
version
deviceModel
scope
payloadHash
createdBy
createdAt
approvedBy
activatedAt
rollbackVersion
```

Une configuration active ne doit jamais être remplacée sans conserver la précédente.

## 20. Hiérarchie de configuration

Ordre recommandé :

```text
PLATFORM_DEFAULT
COUNTRY
ORGANIZATION
DEVICE_GROUP
SITE
DEVICE
```

Les paramètres hérités doivent être visibles dans l’administration.

## 21. Configuration autorisée localement

Certains paramètres peuvent être modifiables localement :

- luminosité ;
- volume ;
- langue par défaut ;
- imprimante active ;
- seuil de papier ;
- préférences d’affichage.

Les règles financières, d’authentification ou de sécurité critique ne doivent pas être librement modifiables sur l’appareil.

## 22. Marque blanche

Les équipements doivent supporter une personnalisation par organisation lorsque le produit le prévoit :

- logo ;
- nom ;
- couleurs ;
- écran d’accueil ;
- reçus ;
- signalétique ;
- messages ;
- langue ;
- mentions légales ;
- mention facultative `Propulsé par Mansa`.

La personnalisation ne doit pas masquer les messages de sécurité ou réglementaires obligatoires.

## 23. Langues

Le contenu embarqué doit s’appuyer sur le domaine de localisation.

Au Mali, les équipements concernés doivent pouvoir afficher au minimum les langues activées par la politique produit, notamment français et bambara lorsqu’ils sont prévus, ainsi que l’anglais lorsque configuré.

Les textes critiques hors ligne doivent être disponibles localement.

## 24. Mises à jour logicielles

Types :

```text
APP_UPDATE
FIRMWARE_UPDATE
CONFIG_UPDATE
CONTENT_UPDATE
CERTIFICATE_ROTATION
SECURITY_PATCH
```

Chaque package doit avoir :

- version ;
- checksum ;
- signature ;
- compatibilité ;
- taille ;
- date ;
- environnement ;
- notes de version ;
- procédure de rollback.

## 25. Déploiement progressif

Stratégies :

```text
CANARY
PERCENTAGE
SITE_BY_SITE
DEVICE_GROUP
COUNTRY_WAVE
MANUAL_APPROVAL
EMERGENCY_ALL
```

Exemple :

```text
1 % pilote
-> 5 %
-> 20 %
-> 50 %
-> 100 %
```

Chaque vague peut être suspendue automatiquement en cas de taux d’échec anormal.

## 26. Rollback

Le rollback doit être possible lorsque techniquement supporté.

Le système conserve :

- version précédente ;
- motif ;
- auteur ou moteur automatique ;
- appareils concernés ;
- résultat ;
- incidents associés.

Un firmware non réversible doit être explicitement marqué.

## 27. Commandes distantes

Commandes possibles selon autorisation :

```text
PING
REFRESH_CONFIG
RESTART_APP
REBOOT_DEVICE
SYNC_TIME
ROTATE_CREDENTIAL
DOWNLOAD_LOG_BUNDLE
RUN_DIAGNOSTIC
LOCK_DEVICE
UNLOCK_DEVICE
CLEAR_LOCAL_CACHE_SAFE
UPDATE_SOFTWARE
UPDATE_FIRMWARE
```

Les commandes financières directes arbitraires sont interdites.

## 28. Autorisation des commandes

Chaque commande doit vérifier :

- rôle ;
- organisation ;
- scope ;
- type d’appareil ;
- environnement ;
- niveau de risque ;
- éventuelle double validation.

Les commandes les plus sensibles peuvent exiger une approbation supplémentaire.

## 29. Idempotence des commandes

Chaque commande doit posséder un `commandId` durable.

Un appareil qui reçoit deux fois la même commande ne doit pas nécessairement exécuter deux fois l’action.

Les résultats possibles :

```text
QUEUED
DELIVERED
ACKNOWLEDGED
RUNNING
SUCCEEDED
FAILED
EXPIRED
CANCELLED
```

## 30. Réseau intermittent

Une commande non délivrée doit avoir une expiration.

Le serveur ne doit pas supposer qu’une commande a été exécutée simplement parce qu’elle a été envoyée.

Au retour réseau :

- l’appareil s’authentifie ;
- remonte son état ;
- récupère les commandes encore valides ;
- ignore les commandes expirées ;
- réconcilie sa configuration.

## 31. Mode hors ligne

Les équipements autorisés doivent pouvoir fonctionner hors ligne selon une politique stricte.

Le cache local peut contenir :

- configuration signée ;
- tarifs ;
- langues ;
- listes minimales ;
- files d’événements ;
- compteurs ;
- informations nécessaires à la continuité autorisée.

Le cache ne doit pas devenir une copie illimitée du backend.

## 32. Synchronisation

La synchronisation doit supporter :

- idempotence ;
- reprise après coupure ;
- ordre logique ;
- détection des doublons ;
- horodatage fiable ;
- conflits ;
- accusé de réception ;
- taille de lot configurable.

Les événements financiers ne sont jamais simplement « écrasés » par le dernier état reçu.

## 33. Horloge

La dérive d’horloge doit être surveillée.

Un terminal fortement désynchronisé peut provoquer :

- erreurs de certificats ;
- incohérences d’audit ;
- mauvais ordonnancement ;
- problèmes de signatures.

Le système doit remonter un signal de dérive.

## 34. Localisation physique

Selon les droits et le matériel :

- site déclaré ;
- dernière position GPS si autorisée ;
- voie ;
- magasin ;
- agence ;
- zone ;
- terminal fixe ou mobile.

Une position GPS n’est pas nécessaire pour tout équipement.

## 35. Détection de déplacement anormal

Pour un appareil fixe, un changement de site peut déclencher :

- alerte ;
- suspension ;
- demande de réenrôlement ;
- validation administrateur.

Le comportement doit être configurable.

## 36. Perte ou vol

Workflow recommandé :

```text
REPORT_LOST_OR_STOLEN
-> SUSPEND
-> REVOKE_CREDENTIALS
-> INVALIDATE_SESSIONS
-> ATTEMPT_REMOTE_LOCK_IF_SUPPORTED
-> AUDIT
-> REPLACEMENT
```

Le système ne doit pas dépendre du succès d’un effacement distant pour considérer les secrets révoqués.

## 37. Appareil compromis

Indicateurs possibles :

- root/jailbreak selon plateforme ;
- bootloader non conforme ;
- certificat cloné ;
- signature applicative invalide ;
- modification binaire ;
- environnement d’exécution non autorisé ;
- changement matériel inattendu ;
- comportement réseau anormal ;
- commandes falsifiées.

Une suspicion peut déclencher limitation, quarantaine ou suspension.

## 38. Quarantaine

Un appareil en quarantaine :

- reste visible ;
- ne reçoit plus de secrets nouveaux ;
- ne peut plus initier les opérations interdites ;
- peut encore envoyer des diagnostics minimaux ;
- nécessite une procédure de sortie explicite.

## 39. Journaux

Les logs techniques peuvent contenir :

- erreurs ;
- versions ;
- codes de diagnostic ;
- durée d’opération ;
- périphérique concerné ;
- identifiants techniques non secrets.

Ils doivent exclure :

- PIN ;
- CVV ;
- PAN complet ;
- secret API ;
- clé privée ;
- token d’accès complet ;
- document KYC brut non nécessaire.

## 40. Bundle de diagnostic

Un bundle de support peut contenir :

```text
manifest
versions
health snapshot
recent non-sensitive events
network diagnostics
peripheral status
crash reports
configuration hash
```

Le bundle doit être limité dans le temps et en taille.

## 41. Métriques

Métriques possibles :

- uptime ;
- taux d’erreur ;
- latence ;
- réseau ;
- batterie ;
- stockage ;
- température si capteur ;
- papier restant ;
- niveau de cash ;
- erreurs EMV ;
- erreurs scanner ;
- ouvertures de barrière ;
- disponibilité par périphérique.

Les métriques à forte volumétrie doivent être agrégées.

## 42. Alertes

Exemples :

```text
DEVICE_OFFLINE
DEVICE_COMPROMISED
CERTIFICATE_EXPIRING
SOFTWARE_OUTDATED
FIRMWARE_OUTDATED
PRINTER_PAPER_LOW
CASH_LEVEL_HIGH
CASH_CHANGE_LOW
EMV_READER_FAILURE
RFID_READER_FAILURE
ANPR_FAILURE
BARRIER_FAILURE
CLOCK_DRIFT
STORAGE_LOW
UPDATE_FAILED
```

Les alertes doivent être dédupliquées et priorisées.

## 43. Maintenance

Une maintenance doit pouvoir enregistrer :

- appareil ;
- technicien ;
- société ;
- diagnostic ;
- pièces remplacées ;
- date de début ;
- date de fin ;
- tests ;
- résultat ;
- photos facultatives ;
- signature ou validation ;
- coût si suivi.

## 44. Maintenance préventive

Des plans peuvent être déclenchés selon :

- temps ;
- nombre de transactions ;
- nombre de cycles ;
- volume cash ;
- alertes ;
- recommandations fabricant.

## 45. Inventaire et stock

Le domaine peut suivre :

- stock neuf ;
- stock configuré ;
- stock affecté ;
- stock en transit ;
- stock réparation ;
- stock rebut.

Les accessoires critiques peuvent avoir leur propre inventaire.

## 46. Remplacement

Lors d’un remplacement :

1. suspendre l’ancien appareil si nécessaire ;
2. enregistrer le motif ;
3. préparer le nouvel appareil ;
4. transférer uniquement les paramètres autorisés ;
5. provisionner de nouveaux identifiants ;
6. ne jamais copier une clé privée non exportable ;
7. affecter le nouvel appareil ;
8. tester ;
9. archiver l’ancien.

## 47. Fin de vie

Un appareil retiré doit passer par :

```text
RETIRED
-> DATA_SANITIZATION
-> CREDENTIAL_REVOCATION
-> INVENTORY_CLOSURE
-> DECOMMISSIONED
```

La destruction ou revente doit respecter la politique de nettoyage des données.

## 48. Contrôle d’accès administrateur

Rôles possibles :

```text
DEVICE_VIEWER
DEVICE_OPERATOR
DEVICE_TECHNICIAN
DEVICE_ADMIN
SECURITY_ADMIN
FLEET_AUDITOR
```

Les rôles financiers ne donnent pas automatiquement les droits de gestion matérielle.

## 49. Multi-tenant

Toutes les requêtes doivent respecter l’isolation par organisation.

Un concessionnaire ne doit pas voir les équipements d’un autre concessionnaire.

Un technicien externe peut recevoir un accès temporaire limité à un site ou une liste d’appareils.

## 50. Audit

Toute action importante doit produire un événement d’audit :

- enrôlement ;
- activation ;
- changement d’affectation ;
- modification de configuration ;
- commande distante ;
- mise à jour ;
- rollback ;
- suspension ;
- révocation ;
- maintenance ;
- remplacement ;
- changement de branding ;
- changement de politique hors ligne.

L’audit indique auteur, date, scope, ancienne valeur, nouvelle valeur et motif lorsque pertinent.

## 51. Exigences de référence — péage classique

Pour tout équipement de péage géré par ce domaine, Mansa doit conserver deux solutions initiales coexistantes :

- **A — péage automatique classique avec barrière** ;
- **B — télépéage RFID avec barrière**.

Une évolution ultérieure optionnelle vers du free-flow sans barrière peut être ajoutée, mais ne doit jamais supprimer ou remplacer automatiquement les deux architectures initiales.

## 52. Moyens de paiement du péage classique

Selon les canaux activés et les capacités réelles de la borne, le péage classique doit pouvoir accepter :

- billets FCFA/XOF ;
- pièces FCFA/XOF ;
- carte bancaire EMV ;
- réseaux activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

Mansa ne doit jamais prétendre garantir toutes les cartes du monde.

## 53. Politique Mobile Money aux péages

Mobile Money doit rester configurable aux niveaux :

```text
NATIONAL
NETWORK
TOLL_PLAZA
LANE
```

Chaque activation ou désactivation doit conserver :

- ancienne valeur ;
- nouvelle valeur ;
- auteur ;
- date d’effet ;
- motif ;
- audit.

Le canal ne doit jamais être supprimé automatiquement du produit.

## 54. Télépéage RFID initial

Le télépéage initial utilise :

- tag UHF RFID passif ;
- tag associé à un véhicule ;
- compte ou abonnement associé ;
- lecteur/antenne ;
- contrôleur local ;
- relais `OPEN` ;
- barrière ;
- capteurs de passage.

Le domaine de flotte doit superviser séparément lecteur, contrôleur, relais et capteurs.

## 55. Péage hors ligne

Le contrôleur local doit pouvoir conserver un fonctionnement sécurisé hors ligne selon politique.

Il doit notamment préserver :

- absence de double débit ;
- journal local protégé ;
- files idempotentes ;
- tarifs et règles nécessaires ;
- resynchronisation ;
- rapprochement après retour réseau.

Un redémarrage ne doit pas perdre silencieusement les événements en attente.

## 56. Trois niveaux d’équipement péage

Le domaine doit supporter :

### Voie automatique complète

Borne, paiement électronique, cash automatisé, périphériques et barrière.

### Voie semi-automatique

Agent avec terminal sécurisé, gestion de caisse et contrôle de voie.

### Poste numérisé à faible coût

Équipement existant conservé avec terminal ou tablette Mansa et numérisation progressive.

L’État ne doit pas être obligé de remplacer tous les postes immédiatement.

## 57. Déploiement progressif péage

La flotte doit pouvoir être déployée :

- par corridor ;
- région ;
- réseau ;
- poste ;
- voie ;
- type d’équipement ;
- vague pilote.

Un pilote peut coexister avec les anciennes procédures pendant la transition lorsque l’administration l’autorise.

## 58. Modèles commerciaux péage

Deux modèles doivent être supportés :

1. matériel acheté directement par l’État ou le concessionnaire et intégré à Mansa ;
2. matériel fourni, intégré ou revendu par Mansa.

Les politiques techniques ne doivent pas imposer artificiellement le second modèle.

## 59. Interfaces industrielles péage

Les barrières et équipements doivent pouvoir être intégrés via adaptateurs lorsque l’interface est documentée, notamment :

- relais/contact sec ;
- API ;
- SDK ;
- TCP/IP ;
- RS-232 ;
- RS-485 ;
- GPIO ;
- interface industrielle documentée.

Le domaine doit stocker le type d’interface et sa version.

## 60. Anti-corruption péage

La supervision doit permettre de rapprocher :

```text
véhicule détecté
-> catégorie véhicule
-> tarif attendu
-> transaction/paiement
-> autorisation d’ouverture
-> ouverture réelle de barrière
-> passage physique
```

Toute ouverture manuelle doit être auditée avec agent, rôle, heure, voie, motif et transaction associée ou absence de transaction.

Une commande distante ne doit jamais permettre d’effacer ce journal.

## 61. Sécurité des paiements carte

Le terminal ne doit pas remonter au backend Mansa des données carte sensibles non nécessaires.

Le traitement carte doit respecter l’architecture de l’acquéreur et du fournisseur de paiement.

Les interfaces Mansa utilisent des références tokenisées ou identifiants de transaction lorsque possible.

## 62. Appareils mobiles agents

Pour un terminal agent :

- liaison utilisateur-appareil ;
- session courte ou politique adaptée ;
- verrouillage automatique ;
- biométrie uniquement comme mécanisme local autorisé, jamais comme donnée biométrique brute envoyée sans nécessité ;
- révocation distante ;
- limitation des fonctions hors ligne ;
- audit des actions sensibles.

Un agent quittant l’organisation doit perdre l’accès indépendamment du statut matériel.

## 63. TPE commerçant

Le TPE commerçant peut recevoir :

- configuration magasin ;
- moyens de paiement activés ;
- limites ;
- branding ;
- taxes ;
- catalogue léger si nécessaire ;
- règles offline ;
- version applicative.

Il ne doit pas permettre au commerçant de modifier les paramètres acquéreur protégés.

## 64. API de flotte

Endpoints conceptuels :

```text
POST   /devices/enrollments
GET    /devices
GET    /devices/{id}
POST   /devices/{id}/assignments
POST   /devices/{id}/commands
GET    /devices/{id}/health
GET    /devices/{id}/events
POST   /device-groups
POST   /device-configurations
POST   /device-deployments
POST   /device-incidents
POST   /device-maintenance
```

Les noms finaux suivent les conventions API Mansa.

## 65. Événements

Événements possibles :

```text
device.enrolled
device.activated
device.offline
device.online
device.degraded
device.compromised
device.suspended
device.configuration.updated
device.software.updated
device.update.failed
device.command.completed
device.peripheral.failed
device.maintenance.started
device.maintenance.completed
```

Les webhooks partenaires suivent les règles d’authentification et de rejeu de la plateforme développeur.

## 66. Notifications

Les alertes peuvent être envoyées à :

- exploitation ;
- support ;
- sécurité ;
- responsable de site ;
- commerçant ;
- administration ;
- mainteneur autorisé.

La sévérité et les destinataires sont configurables.

## 67. Protection contre les commandes dangereuses

Le système doit refuser :

- commande inconnue ;
- commande non supportée par le modèle ;
- commande expirée ;
- commande destinée à un autre environnement ;
- commande sans autorisation ;
- commande en conflit avec une maintenance ;
- commande financière arbitraire ;
- commande permettant d’effacer un audit critique.

## 68. Tests

Tests minimaux :

- enrôlement réussi ;
- code expiré ;
- appareil inconnu ;
- certificat révoqué ;
- heartbeat ;
- appareil offline ;
- configuration héritée ;
- rollback ;
- commande idempotente ;
- commande expirée ;
- isolation tenant ;
- périphérique en panne ;
- mode dégradé ;
- file offline ;
- reprise réseau ;
- perte/vol ;
- mise à jour canary ;
- rollback update ;
- péage double débit impossible après resynchronisation ;
- ouverture manuelle auditée ;
- Mobile Money désactivé au niveau voie mais actif ailleurs ;
- terminal sans capacité cash n’affiche pas cash.

## 69. Tests de sécurité

Tester notamment :

- usurpation de `deviceId` ;
- replay de heartbeat ;
- replay de commande ;
- certificat expiré ;
- certificat révoqué ;
- changement de tenant ;
- tentative de commande cross-tenant ;
- package de mise à jour falsifié ;
- checksum invalide ;
- downgrade non autorisé ;
- injection dans logs ;
- extraction de secrets ;
- appareil compromis ;
- accès technicien expiré.

## 70. Tests de charge

Simuler :

- dizaines de milliers d’appareils ;
- reconnexion simultanée après panne réseau ;
- déploiement d’une configuration ;
- campagne de mise à jour ;
- rafale de heartbeats ;
- incident national ;
- reprise après coupure opérateur.

Le backend doit éviter les tempêtes de reconnexion avec jitter et backoff.

## 71. Observabilité

Dashboards recommandés :

- appareils actifs ;
- offline ;
- dégradés ;
- versions ;
- taux de mise à jour ;
- pannes par modèle ;
- alertes par site ;
- certificats expirants ;
- santé des périphériques ;
- disponibilité par région ;
- erreurs de synchronisation.

## 72. SLA opérationnel

Les objectifs peuvent varier par classe :

```text
CRITICAL_INFRASTRUCTURE
PAYMENT_TERMINAL
STANDARD_TERMINAL
MOBILE_AGENT_DEVICE
NON_CRITICAL_PERIPHERAL
```

Les bornes de péage et équipements de paiement peuvent recevoir des seuils plus stricts.

## 73. Conservation des données

Les données de flotte doivent suivre des durées distinctes :

- télémétrie fine : courte durée ;
- métriques agrégées : durée plus longue ;
- audit critique : selon politique de conformité ;
- logs diagnostic : durée limitée ;
- historique de maintenance : durée opérationnelle longue.

La suppression doit préserver les obligations d’audit nécessaires.

## 74. Vie privée

La télémétrie doit rester proportionnée.

Mansa ne doit pas collecter en permanence des informations personnelles inutiles simplement parce qu’un terminal possède caméra, GPS ou microphone.

Les capteurs sont activés selon le service et la politique applicables.

## 75. Données de localisation et employés

Pour les appareils agents, le suivi de localisation doit être limité aux cas légitimes, documentés et configurés.

L’administration doit distinguer appareil fixe, appareil de flotte et appareil personnel autorisé.

## 76. Compatibilité future

Le modèle doit pouvoir accueillir :

- nouveaux fabricants ;
- nouveaux TPE ;
- nouveaux périphériques cash ;
- nouveaux protocoles ;
- nouveaux types de bornes ;
- nouvelles architectures free-flow ;
- edge computing ;
- attestation matérielle avancée.

Ces ajouts ne doivent pas forcer une migration destructrice des appareils existants.

## 77. Critères d’acceptation

Le module est considéré prêt lorsque :

1. un appareil peut être enregistré et enrôlé sans secret statique partagé global ;
2. son organisation, site et capacités sont identifiés ;
3. une configuration versionnée peut lui être affectée ;
4. sa santé et ses périphériques sont visibles ;
5. les commandes distantes sont autorisées et auditées ;
6. les mises à jour supportent canary et rollback ;
7. perte, vol et compromis peuvent entraîner révocation ;
8. le mode offline est borné et resynchronisable ;
9. l’isolation multi-tenant est testée ;
10. les terminaux de paiement ne journalisent pas de secrets carte ;
11. les architectures de péage classique et télépéage RFID coexistent ;
12. Mobile Money reste configurable sans suppression de code ;
13. les barrières peuvent être intégrées derrière adaptateur ;
14. les trois niveaux d’équipement péage sont supportés ;
15. les ouvertures manuelles sont auditables ;
16. le même modèle de flotte fonctionne pour État, concessionnaire, entreprise et commerçant.

## 78. Résultat attendu

Mansa doit disposer d’un système de flotte qui ne se limite pas à une liste de terminaux.

Chaque équipement devient un actif technique géré sur tout son cycle de vie : inventaire, enrôlement, identité, affectation, configuration, santé, commandes, mise à jour, maintenance, incident, sécurité, remplacement et fin de vie.

Cette architecture doit permettre de déployer progressivement Mansa sur des matériels hétérogènes au Mali puis dans d’autres pays, sans verrouillage fournisseur, sans fragiliser les flux financiers et sans perdre la traçabilité opérationnelle.