# Cahier des charges — Gestion des terminaux, appareils, provisioning et télémaintenance

## 1. Objet

Ce document définit les exigences Mansa pour la gestion centralisée du parc d’appareils utilisés par la plateforme : TPE Android, terminaux agents, tablettes État, bornes de péage, contrôleurs de voie, kiosques, scanners, imprimantes, postes commerçants, dispositifs de support et futurs équipements connectés.

L’objectif est de disposer d’un socle de gestion de flotte sécurisé, multi-tenant, multi-fournisseurs et multi-pays permettant de provisionner, identifier, configurer, superviser, mettre à jour, révoquer et auditer chaque appareil sans dépendre d’un fabricant unique.

Ce module ne remplace pas les MDM constructeurs lorsqu’ils sont nécessaires. Il fournit une couche Mansa commune capable de s’intégrer à un MDM, à un SDK constructeur, à un agent local ou à une API industrielle.

## 2. Périmètre

Le domaine couvre au minimum :

- TPE Android et terminaux EMV ;
- terminaux agents cash-in/cash-out ;
- tablettes et terminaux des services État ;
- terminaux commerçants et Admin Lite ;
- bornes de péage automatiques et semi-automatiques ;
- contrôleurs locaux de voie ;
- lecteurs RFID UHF et contrôleurs associés ;
- équipements ANPR lorsque gérés par Mansa ;
- kiosques et distributeurs ;
- imprimantes de reçus ;
- scanners QR/code-barres ;
- périphériques espèces lorsqu’une télémétrie est disponible ;
- postes de support et appareils d’administration autorisés.

Les téléphones personnels des clients ne sont pas administrés comme des appareils Mansa, mais peuvent être enregistrés comme appareils de confiance dans le domaine identité/sécurité.

## 3. Principes directeurs

Le système doit respecter les principes suivants :

1. identité unique de chaque appareil ;
2. moindre privilège ;
3. aucun secret statique partagé entre toute une flotte ;
4. provisioning traçable ;
5. configuration versionnée ;
6. mises à jour progressives et réversibles ;
7. fonctionnement hors ligne lorsque le métier l’exige ;
8. séparation stricte entre tenants et organisations ;
9. inventaire matériel et logiciel vérifiable ;
10. révocation rapide en cas de perte, vol ou compromission ;
11. aucune dépendance obligatoire à un fabricant unique ;
12. audit complet des opérations sensibles.

## 4. Modèle multi-tenant

Chaque appareil doit être rattaché explicitement à une organisation ou à un tenant.

Exemples :

```text
Mansa
État / ministère
agence publique
concessionnaire
banque partenaire
entreprise
commerçant
réseau d’agents
site industriel
parking
réseau de péage
```

Un appareil ne doit jamais accéder aux données, secrets, configurations ou commandes d’un autre tenant sans relation et autorisation explicites.

Le rattachement doit pouvoir évoluer selon un workflow contrôlé de transfert de propriété ou de réaffectation.

## 5. Entités principales

Modèle recommandé :

```text
Device
DeviceIdentity
DeviceModel
DeviceVendor
DeviceCapability
DeviceAssignment
DeviceGroup
DevicePolicy
DeviceConfiguration
DeviceConfigurationVersion
DeviceCredential
DeviceCertificate
DeviceAttestation
DeviceCommand
DeviceCommandResult
DeviceHeartbeat
DeviceSoftware
DeviceSoftwareRelease
DeviceUpdateCampaign
DeviceIncident
DeviceMaintenance
DevicePeripheral
DeviceLocation
DeviceAuditEvent
```

Chaque entité sensible doit inclure les identifiants de tenant, pays, environnement et audit nécessaires.

## 6. Identité de l’appareil

Chaque appareil possède un identifiant Mansa non ambigu, indépendant du numéro de série constructeur.

Exemples de données :

```text
device_id
serial_number
manufacturer
model
hardware_revision
os_name
os_version
firmware_version
secure_element_id si disponible
terminal_id métier
merchant_id ou site_id si applicable
country_code
environment
```

Les numéros de série ou identifiants matériels ne doivent pas constituer seuls un mécanisme d’authentification.

## 7. Cycle de vie

États recommandés :

```text
ORDERED
RECEIVED
STAGED
PROVISIONING
ACTIVE
SUSPENDED
MAINTENANCE
QUARANTINED
LOST
STOLEN
RETIRED
DESTROYED
```

Chaque transition doit être autorisée, horodatée et auditée.

Un appareil `LOST`, `STOLEN`, `QUARANTINED` ou `RETIRED` ne doit plus pouvoir obtenir de nouvelles autorisations métier normales.

## 8. Provisioning initial

Le provisioning doit pouvoir suivre plusieurs modes :

```text
FACTORY_PREPROVISIONED
QR_ENROLLMENT
ONE_TIME_CODE
ADMIN_ENROLLMENT
MDM_ENROLLMENT
CERTIFICATE_BOOTSTRAP
LOCAL_INSTALLER
```

Le secret ou code initial doit être à usage unique et expirer rapidement.

Après activation, l’appareil doit obtenir une identité durable spécifique à lui-même, idéalement fondée sur un certificat ou une clé générée localement dans un stockage sécurisé lorsque le matériel le permet.

## 9. Enrôlement sécurisé

Le workflow recommandé :

1. appareil déclaré dans l’inventaire ;
2. association au modèle et à l’organisation ;
3. génération d’un mécanisme d’enrôlement temporaire ;
4. vérification de l’appareil ;
5. création ou validation d’une paire de clés ;
6. émission des identifiants/certificats nécessaires ;
7. affectation des politiques ;
8. téléchargement de la configuration initiale ;
9. test de connectivité ;
10. activation ;
11. journal d’audit.

Aucun secret de production ne doit être préchargé en clair dans une image logicielle générique.

## 10. Authentification machine-to-machine

Les appareils doivent s’authentifier via des mécanismes adaptés :

- certificat mTLS ;
- clé asymétrique ;
- token court signé après authentification ;
- attestation matérielle lorsqu’elle existe ;
- mécanisme constructeur validé derrière un adaptateur.

Les clés privées doivent être non exportables lorsque le matériel le permet.

Les tokens d’accès doivent être courts, révocables et limités au périmètre de l’appareil.

## 11. Certificats et rotation

Le système doit gérer :

- émission ;
- renouvellement ;
- rotation ;
- révocation ;
- expiration ;
- remplacement après maintenance ;
- changement de chaîne de confiance.

Une campagne de rotation massive doit pouvoir être progressive afin d’éviter l’indisponibilité de toute une flotte.

## 12. Capacités matérielles

Les capacités ne doivent pas être déduites uniquement du modèle déclaré.

Exemples :

```text
EMV_CONTACT
EMV_CONTACTLESS
NFC
QR_CAMERA
QR_SCANNER
PRINTER
BIOMETRIC_SENSOR
GPS
CELLULAR
WIFI
ETHERNET
RFID_UHF
ANPR_CONTROLLER
RELAY_OUTPUT
CASH_ACCEPTOR
COIN_ACCEPTOR
CASH_RECYCLER
BARRIER_CONTROLLER
SECURE_ELEMENT
```

Le backend peut exiger une confirmation de capacité remontée par l’appareil ou par son adaptateur.

## 13. Profils d’appareils

Des profils permettent d’appliquer rapidement une politique cohérente.

Exemples :

```text
TPE_MERCHANT
AGENT_TERMINAL
STATE_FIELD_TABLET
TOLL_FULL_AUTOMATIC
TOLL_SEMI_AUTOMATIC
TOLL_LOW_COST_DIGITAL
TOLL_LANE_CONTROLLER
KIOSK
ADMIN_WORKSTATION
```

Un profil n’accorde pas automatiquement tous les droits métier ; les permissions restent contrôlées par les politiques d’accès appropriées.

## 14. Configuration distante

La configuration doit être déclarative, versionnée et signée ou protégée contre l’altération selon le niveau de criticité.

Exemples :

```text
API endpoints autorisés
pays et devise
tenant
site
langues
imprimante
seuils locaux
features activées
moyens de paiement activés
paramètres réseau
politique offline
horaires
branding
```

Une modification doit conserver : ancienne version, nouvelle version, auteur, justification, date d’effet et cible.

## 15. Hiérarchie de configuration

Une configuration peut être héritée selon une hiérarchie contrôlée.

Exemple :

```text
GLOBAL
→ COUNTRY
→ TENANT
→ NETWORK
→ SITE
→ DEVICE_GROUP
→ DEVICE
```

Les priorités et overrides doivent être explicites afin d’éviter les comportements ambigus.

## 16. Feature flags sur appareils

Les fonctionnalités à risque peuvent être activées progressivement par :

- pays ;
- organisation ;
- groupe d’appareils ;
- modèle ;
- version logicielle ;
- pourcentage de flotte ;
- appareil précis.

Les feature flags ne doivent jamais servir à contourner les contrôles réglementaires ou de sécurité obligatoires.

## 17. Heartbeat et état de santé

Les appareils connectés doivent publier un heartbeat selon une fréquence adaptée au contexte.

Données possibles :

```text
last_seen_at
connectivity
battery_level
power_source
storage_free
memory_pressure
cpu_temperature
os_version
app_version
firmware_version
peripheral_status
clock_drift
offline_queue_depth
```

La fréquence doit être configurable pour ne pas consommer inutilement la data mobile.

## 18. Inventaire logiciel

Mansa doit connaître les versions actives :

- OS ;
- application Mansa ;
- services auxiliaires ;
- SDK paiement ;
- firmware ;
- drivers ;
- modules périphériques critiques.

L’inventaire ne doit pas collecter des applications personnelles non pertinentes lorsque l’appareil n’est pas entièrement géré par Mansa.

## 19. Politique de versions minimales

Chaque type d’appareil peut définir :

```text
minimum_supported_version
recommended_version
blocked_version
forced_upgrade_version
```

Une version compromise peut être bloquée immédiatement ou placée en quarantaine selon la criticité.

## 20. Mises à jour OTA

Les mises à jour doivent supporter :

1. publication de release ;
2. signature/vérification d’intégrité ;
3. groupe pilote ;
4. rollout progressif ;
5. suivi des erreurs ;
6. pause automatique si seuil d’échec dépassé ;
7. reprise ;
8. rollback si techniquement possible ;
9. clôture avec rapport.

Les appareils critiques ne doivent pas tous redémarrer simultanément.

## 21. Fenêtres de maintenance

Les mises à jour peuvent être limitées à des fenêtres adaptées :

- hors heures d’ouverture ;
- hors période de pointe ;
- borne de péage uniquement lorsque la voie peut être fermée ou basculée ;
- terminal agent hors session active ;
- TPE après clôture ou absence de transaction en cours.

Une mise à jour ne doit pas interrompre volontairement une transaction financière en cours.

## 22. Rollback

Lorsque la plateforme le permet, un rollback doit restaurer une version connue stable.

Le système doit distinguer :

- rollback applicatif ;
- rollback configuration ;
- rollback firmware ;
- impossibilité de downgrade constructeur.

Le rollback doit être audité et ne pas restaurer des secrets expirés ou révoqués.

## 23. Commandes distantes

Commandes possibles, strictement autorisées :

```text
REFRESH_CONFIG
SYNC_TIME
ROTATE_CREDENTIAL
RESTART_APP
RESTART_DEVICE
RUN_DIAGNOSTIC
PRINT_TEST
LOCK_DEVICE
UNLOCK_DEVICE
ENTER_MAINTENANCE
EXIT_MAINTENANCE
CLEAR_NON_SENSITIVE_CACHE
```

Les commandes destructrices ou à fort impact exigent des permissions renforcées et, selon le cas, une double validation.

## 24. Commandes interdites par défaut

Le système ne doit pas fournir sans contrôle renforcé :

- extraction de secrets ;
- lecture distante du PIN ;
- récupération de clés privées ;
- désactivation silencieuse des journaux d’audit ;
- contournement des protections EMV ;
- ouverture arbitraire d’une barrière sans événement métier et audit ;
- effacement des preuves d’incident.

## 25. Gestion perte et vol

Lorsqu’un appareil est perdu ou volé :

1. passage à `LOST` ou `STOLEN` ;
2. révocation des sessions et certificats ;
3. blocage des opérations sensibles ;
4. tentative de verrouillage distant si disponible ;
5. conservation de la dernière localisation autorisée si politique applicable ;
6. ouverture d’un incident ;
7. remplacement contrôlé.

Un appareil retrouvé ne doit pas repasser `ACTIVE` sans procédure de vérification.

## 26. Quarantaine

La quarantaine est utilisée lorsqu’un appareil présente :

- attestation invalide ;
- version compromise ;
- comportement anormal ;
- certificat incohérent ;
- rooting/jailbreak détecté lorsque pertinent ;
- modifications système non autorisées ;
- échecs de sécurité répétés.

En quarantaine, seules les opérations minimales de diagnostic et remédiation sont permises.

## 27. Détection d’intégrité

Selon les capacités disponibles, Mansa peut utiliser :

- attestation OS ;
- secure boot ;
- vérification de signature ;
- hash de composants critiques ;
- état bootloader ;
- indicateurs root/jailbreak ;
- état de l’agent MDM.

L’absence d’une technologie particulière sur un appareil low-cost ne doit pas être présentée comme une preuve de sécurité équivalente.

## 28. Localisation

La localisation d’un appareil doit être limitée au besoin opérationnel.

Sources possibles :

- site configuré ;
- GPS autorisé ;
- réseau ;
- borne/voie fixe ;
- dernière affectation connue.

Toute collecte de géolocalisation doit respecter les règles de confidentialité, la finalité et la conservation définies.

## 29. Réseau

Les appareils doivent supporter les réseaux adaptés au contexte :

```text
Ethernet
Wi-Fi
4G/5G
APN privé
VPN si requis
multi-SIM selon matériel
```

Le système doit détecter les pertes de connectivité et basculer vers le mode hors ligne lorsque le produit l’autorise.

## 30. Mode hors ligne

Les terminaux compatibles doivent continuer certaines opérations autorisées sans réseau.

Le cache local peut contenir uniquement les données nécessaires, protégées au repos.

Les événements offline doivent posséder :

```text
local_event_id
device_id
sequence_number
created_at
operation_type
idempotency_key
sync_status
integrity_marker
```

Au retour du réseau :

- resynchronisation ordonnée ;
- détection de doublons ;
- idempotence ;
- gestion des conflits ;
- audit ;
- absence de double débit.

## 31. Stockage local sécurisé

Les appareils ne doivent pas conserver inutilement :

- PIN ;
- CVV/CVC ;
- PAN complet ;
- secrets API ;
- clés privées exportables ;
- documents KYC en clair ;
- données d’autres tenants.

Les données nécessaires au mode offline doivent être chiffrées ou protégées selon les capacités du terminal et supprimées selon une politique de rétention.

## 32. TPE et paiements carte

Le module de gestion d’appareils ne contourne jamais les certifications ou responsabilités du terminal de paiement.

Les composants EMV, PIN pad, kernel, clés et paramètres acquéreur doivent rester gérés selon les exigences du partenaire/acquéreur et du matériel certifié.

Mansa peut orchestrer la configuration autorisée via des adaptateurs, mais ne doit pas manipuler directement des clés de paiement sensibles hors des environnements prévus à cet effet.

Le terminal carte doit accepter les réseaux activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles, sans prétendre garantir toutes les cartes du monde.

## 33. Réseau d’agents

Un terminal agent doit être associé à :

- agent ;
- point de service ;
- organisation ;
- pays ;
- permissions ;
- limites opérationnelles ;
- statut du terminal.

Le changement d’agent ou de point de service doit être explicite et audité.

Un agent suspendu ne doit pas pouvoir réactiver localement son terminal.

## 34. Tablettes État

Les appareils utilisés par l’État peuvent nécessiter :

- profil dédié ;
- applications autorisées ;
- certificats institutionnels ;
- verrouillage renforcé ;
- gestion de session agent ;
- journaux d’audit ;
- politique de perte/vol ;
- fonctionnement hors ligne ;
- synchronisation différée.

Les droits d’un agent public sont déterminés côté serveur et non uniquement par la possession de la tablette.

## 35. Péages — exigences de référence

Le domaine péage conserve explicitement deux solutions initiales qui coexistent :

- **A — péage automatique classique avec barrière** ;
- **B — télépéage RFID UHF avec barrière**.

Une évolution ultérieure optionnelle vers le free-flow sans barrière peut être ajoutée sans remplacer A ou B.

Le péage classique doit pouvoir accepter, selon les canaux activés :

- billets FCFA ;
- pièces FCFA ;
- carte bancaire EMV multi-réseaux ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

Mobile Money doit être activable ou désactivable par l’administration au niveau national, réseau, poste ou voie, avec date d’effet, auteur et audit. Il ne doit jamais être supprimé automatiquement.

## 36. Télépéage RFID

Le télépéage initial utilise :

- tags UHF RFID passifs ;
- association tag-véhicule-compte ;
- lecteur/antenne ;
- contrôleur local ;
- relais `OPEN` ;
- barrière ;
- capteurs de passage.

Le contrôleur de voie et le lecteur doivent être inventoriés comme appareils ou périphériques avec identité, version, état et configuration.

## 37. Multi-fournisseurs péage

Les bornes, lecteurs, contrôleurs, barrières, périphériques espèces et autres matériels doivent être intégrés derrière des adaptateurs.

Interfaces possibles :

```text
REST / HTTP
SDK constructeur
TCP/IP
USB
RS-232
RS-485
MDB
GPIO
relais / contact sec
interface industrielle documentée
```

Le cœur Mansa ne doit pas dépendre du protocole propriétaire d’un seul fabricant.

## 38. Trois niveaux d’équipement péage

Le système de gestion d’appareils doit représenter les trois profils :

### 38.1 Voie automatique complète

Borne, TPE, scanner, imprimante, modules espèces, contrôleur local, capteurs, RFID/ANPR selon configuration.

### 38.2 Voie semi-automatique

Terminal agent, tiroir/coffre/cassette selon installation, TPE, imprimante, contrôleur de barrière et périphériques.

### 38.3 Poste numérisé à faible coût

Tablette ou terminal Mansa ajouté à une infrastructure existante avec minimum de matériel nouveau.

L’État ne doit pas être obligé d’équiper tous les sites immédiatement.

## 39. Déploiement progressif péage

Une campagne de déploiement doit pouvoir cibler :

```text
pays
réseau
poste
voie
modèle matériel
fournisseur
lot
```

Les pilotes sont validés avant extension.

Un incident sur un modèle de borne doit pouvoir suspendre uniquement le lot concerné.

## 40. Modèles commerciaux matériel

Deux modèles restent supportés :

1. matériel acheté directement par l’État ou le concessionnaire puis intégré par Mansa ;
2. matériel fourni, intégré ou revendu par Mansa.

L’inventaire doit enregistrer propriétaire juridique, exploitant, mainteneur et éventuelle garantie séparément.

## 41. Marque blanche

La configuration distante doit permettre la marque blanche pour :

- bornes ;
- écrans ;
- tags ;
- reçus ;
- signalétique ;
- messages ;
- langues ;
- couleurs et logo autorisés.

La mention `Propulsé par Mansa` est facultative et dépend du contrat/configuration.

Le branding ne doit jamais masquer les messages de sécurité ou informations réglementaires obligatoires.

## 42. Anti-corruption péage

Le système doit permettre de rapprocher :

```text
véhicule détecté
→ catégorie
→ tarif attendu
→ paiement
→ autorisation d’ouverture
→ ouverture physique
→ passage détecté
```

Toute ouverture manuelle de barrière doit générer un événement auditant au minimum : appareil, voie, agent, heure, motif, transaction éventuelle et résultat.

Une commande distante ne doit jamais permettre d’ouvrir une barrière sans produire cet audit.

## 43. Périphériques espèces

Lorsqu’un validateur, monnayeur, recycleur ou coffre expose de la télémétrie, Mansa peut suivre :

```text
online_status
firmware_version
cassette_state
fill_level
change_available
jam_detected
reject_rate
maintenance_required
```

Les commandes physiques sensibles restent limitées aux interfaces documentées et aux rôles autorisés.

## 44. Maintenance terrain

Une intervention doit pouvoir enregistrer :

- technicien ;
- société ;
- appareil ;
- site ;
- diagnostic ;
- pièces remplacées ;
- ancien/nouveau numéro de série ;
- version avant/après ;
- tests réalisés ;
- photos ou justificatifs si autorisés ;
- date de remise en service.

Une intervention ne doit pas effacer l’historique de l’appareil.

## 45. Mode maintenance

Le mode maintenance doit être visible côté plateforme.

Un appareil en maintenance ne doit pas accepter de nouvelles opérations financières sauf scénario de test explicitement isolé.

Les transactions de test doivent être séparées de la production.

## 46. Diagnostic distant

Le diagnostic peut vérifier :

- connectivité API ;
- DNS ;
- horloge ;
- stockage ;
- imprimante ;
- scanner ;
- lecteur NFC ;
- périphériques espèces ;
- relais/barrière en mode test autorisé ;
- version applicative ;
- certificat ;
- file offline.

Les diagnostics doivent éviter d’exposer des données clients ou secrets.

## 47. Observabilité

Métriques recommandées :

```text
devices_total
devices_online
devices_offline
devices_quarantined
heartbeat_age
config_apply_success_rate
update_success_rate
update_failure_rate
certificate_expiry_days
offline_queue_depth
peripheral_failure_rate
command_latency
```

Les métriques doivent être filtrables par pays, tenant, site, modèle et version sans cardinalité incontrôlée.

## 48. Alertes

Alertes possibles :

```text
DEVICE_OFFLINE_TOO_LONG
CERTIFICATE_EXPIRING
CERTIFICATE_REVOKED
UNSUPPORTED_VERSION
UPDATE_FAILURE_SPIKE
DEVICE_TAMPER_DETECTED
PERIPHERAL_FAILURE
CLOCK_DRIFT
OFFLINE_QUEUE_HIGH
UNAUTHORIZED_CONFIGURATION
```

Les seuils varient selon la criticité du profil.

## 49. RBAC

Permissions recommandées :

```text
device.read
device.enroll
device.assign
device.configure
device.update
device.command
device.quarantine
device.revoke
device.maintenance
device.audit.read
```

Les commandes à fort impact doivent pouvoir exiger approbation à deux personnes.

## 50. Séparation des tâches

Selon le contexte, la même personne ne doit pas nécessairement pouvoir :

- enrôler un appareil ;
- lui attribuer un rôle privilégié ;
- modifier sa configuration sensible ;
- effacer son affectation ;
- clôturer seule un incident de sécurité.

Les politiques sont configurables par organisation.

## 51. Audit

Toute opération sensible doit enregistrer :

```text
actor_id
actor_type
device_id
tenant_id
action
before
after
reason
source_ip ou source technique si pertinent
created_at
correlation_id
```

Les journaux d’audit ne doivent pas être modifiables par les opérateurs standards.

## 52. Données sensibles

L’inventaire ne doit jamais devenir un dépôt de secrets.

Il est interdit d’y stocker en clair :

- mots de passe ;
- PIN ;
- CVV ;
- clés privées ;
- clés terminal de paiement ;
- tokens actifs complets ;
- données de piste carte.

Les références vers un gestionnaire de secrets peuvent être conservées sans exposer la valeur.

## 53. API

Endpoints possibles :

```text
POST /devices/enroll
GET /devices
GET /devices/:id
POST /devices/:id/assign
POST /devices/:id/suspend
POST /devices/:id/quarantine
POST /devices/:id/commands
GET /devices/:id/heartbeat
GET /devices/:id/software
POST /device-groups
POST /device-policies
POST /update-campaigns
```

Les endpoints publics de bootstrap doivent être très limités, rate-limités et protégés contre l’énumération.

## 54. Webhooks et événements

Événements possibles :

```text
device.enrolled
device.activated
device.offline
device.online
device.quarantined
device.revoked
device.config.applied
device.update.started
device.update.completed
device.update.failed
device.peripheral.failed
```

Les consommateurs doivent gérer idempotence et retries.

## 55. Résilience

Le service de gestion des appareils ne doit pas être un point de panne qui bloque immédiatement toutes les transactions existantes.

Un terminal déjà provisionné doit pouvoir continuer les opérations autorisées pendant une indisponibilité temporaire du control plane, dans les limites de sa politique locale.

Les nouvelles commandes/configurations peuvent être différées jusqu’au rétablissement.

## 56. Sauvegarde et reprise

Les données essentielles à sauvegarder incluent :

- inventaire ;
- affectations ;
- politiques ;
- versions de configuration ;
- métadonnées certificats ;
- campagnes ;
- audits ;
- maintenance.

Les clés privées des appareils ne doivent pas être sauvegardées côté serveur lorsqu’elles sont conçues pour rester locales et non exportables.

## 57. Environnements

Les identités et credentials doivent être séparés entre :

```text
DEMO
TEST
STAGING
PRODUCTION
```

Un appareil de démonstration ne doit pas pouvoir être utilisé contre les APIs de production sans enrôlement explicite de production.

## 58. Tests obligatoires

Tests minimaux :

- enrôlement valide ;
- code d’enrôlement expiré ;
- réutilisation d’un code one-time ;
- appareil révoqué ;
- certificat expiré ;
- tenant incorrect ;
- application d’une configuration ;
- rollback de configuration ;
- update partiel ;
- perte réseau pendant update ;
- reprise après reboot ;
- mode offline ;
- resynchronisation sans doublon ;
- permission insuffisante ;
- commande distante non autorisée ;
- appareil en quarantaine ;
- transfert d’affectation ;
- tests des adaptateurs matériels.

## 59. Tests sécurité

Le pipeline doit vérifier notamment :

- secrets dans le code ;
- authentification appareil ;
- isolation tenant ;
- replay d’une commande ;
- falsification de heartbeat ;
- downgrade non autorisé ;
- configuration modifiée ;
- certificat volé/révoqué ;
- abus des endpoints d’enrôlement ;
- injection dans les champs de télémétrie ;
- accès à une commande d’un autre tenant.

## 60. Critères d’acceptation

Le module est acceptable lorsque :

1. chaque appareil de production possède une identité unique et une affectation ;
2. aucune flotte ne partage un secret statique universel ;
3. les configurations sont versionnées et auditables ;
4. les appareils perdus/volés peuvent être révoqués ;
5. les mises à jour peuvent être déployées progressivement ;
6. les versions et capacités sont inventoriées ;
7. l’isolation multi-tenant est testée ;
8. le mode offline fonctionne sans double débit pour les scénarios autorisés ;
9. les équipements péage restent multi-fournisseurs ;
10. les exigences péage de référence sont conservées ;
11. les commandes sensibles sont RBAC et auditées ;
12. les appareils de test et production sont séparés ;
13. aucun secret interdit n’est exposé dans l’inventaire ou les logs ;
14. les procédures de maintenance, quarantaine et retrait sont opérationnelles.

## 61. Hors périmètre initial

Ne sont pas imposés en phase initiale :

- développement d’un MDM propriétaire complet remplaçant Android Enterprise ou les outils constructeurs ;
- contrôle de téléphones personnels des clients ;
- accès distant arbitraire au bureau d’un utilisateur ;
- collecte de données personnelles sans finalité métier ;
- support de tous les fabricants avant intégration réelle.

Le socle doit cependant rester extensible pour de futurs adaptateurs et catégories d’appareils.
