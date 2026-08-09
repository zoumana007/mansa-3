# Device Management — Parc de terminaux, TPE, bornes et équipements terrain

## 1. Objet

Ce document définit le cahier des charges Mansa pour la gestion centralisée du parc de terminaux et équipements terrain utilisés par l’écosystème :

- TPE Android ;
- terminaux de caisse ;
- bornes de paiement ;
- bornes de péage ;
- tablettes agents ;
- terminaux État ;
- lecteurs RFID ;
- contrôleurs de voie ;
- imprimantes ;
- scanners QR/code-barres ;
- équipements ANPR ;
- équipements connectés compatibles.

Le moteur doit rester multi-fournisseurs. Aucun fabricant unique ne doit devenir une dépendance structurelle de Mansa.

## 2. Principes de conception

Le système doit respecter les principes suivants :

- inventaire unique et auditable ;
- séparation stricte entre identité logique et matériel physique ;
- provisionnement contrôlé ;
- configuration par politiques ;
- mises à jour signées et vérifiables ;
- possibilité de fonctionnement local/hors ligne ;
- révocation immédiate d’un terminal compromis ;
- zéro secret de production stocké en clair dans Git ou dans l’application ;
- accès minimal par terminal ;
- traçabilité de chaque opération distante ;
- compatibilité multi-pays et multi-organisations ;
- intégration derrière des adaptateurs fabricant/OS/MDM.

## 3. Architecture fonctionnelle

Chaîne générale :

```text
Fabricant / fournisseur / entrepôt
→ enregistrement du matériel
→ contrôle d’identité du terminal
→ affectation organisation / site / utilisateur
→ enrôlement
→ attestation et certificats
→ récupération des politiques
→ activation
→ exploitation
→ télémétrie / supervision
→ maintenance / mise à jour
→ suspension / transfert / retrait
→ effacement sécurisé et archivage
```

Le backend Mansa reste la source de vérité pour l’identité du terminal, son propriétaire logique, ses droits, son état et son historique.

## 4. Modèle de données minimal

Entités recommandées :

```text
Device
DeviceModel
DeviceManufacturer
DeviceEnrollment
DeviceAssignment
DeviceCredential
DeviceCertificate
DevicePolicy
DevicePolicyVersion
DeviceConfiguration
DeviceCapability
DeviceHealth
DeviceTelemetry
DeviceIncident
DeviceMaintenance
DeviceSoftwareRelease
DeviceUpdateCampaign
DeviceCommand
DeviceCommandResult
DeviceInventoryEvent
DeviceAuditLog
```

Chaque entité doit être rattachable à une organisation, un pays, un site et éventuellement un utilisateur, commerçant, agent, administration ou voie de péage.

## 5. Identité du terminal

Chaque terminal doit disposer d’un identifiant Mansa stable indépendant des identifiants du constructeur.

Attributs possibles :

- `deviceId` Mansa ;
- constructeur ;
- modèle ;
- numéro de série ;
- IMEI si applicable ;
- adresse MAC si pertinente ;
- identifiant Android/OS autorisé ;
- version hardware ;
- version firmware ;
- version application ;
- identifiant du certificat ;
- état d’attestation ;
- organisation ;
- site ;
- rôle fonctionnel ;
- date d’enrôlement ;
- date de dernière activité.

Un numéro de série constructeur ne doit jamais être utilisé seul comme preuve d’identité cryptographique.

## 6. Types de terminaux

Le moteur doit au minimum supporter :

```text
PAYMENT_TERMINAL
MERCHANT_POS
AGENT_TERMINAL
STATE_TERMINAL
TOLL_KIOSK
TOLL_LANE_CONTROLLER
RFID_READER
ANPR_CAMERA
QR_SCANNER
PRINTER
TABLET
MOBILE_DEVICE
OTHER_MANAGED_DEVICE
```

Les capacités réelles doivent être détectées ou déclarées séparément du type.

## 7. Capacités matérielles

Exemples de capacités :

```text
EMV_CONTACT
EMV_CONTACTLESS
NFC
QR_SCAN
QR_DISPLAY
BARCODE_SCAN
PRINTER
CASH_BILL_VALIDATOR
CASH_COIN_VALIDATOR
CASH_RECYCLER
RFID_UHF
ANPR
GPS
CAMERA
BIOMETRIC_SENSOR
ETHERNET
WIFI
CELLULAR
BLUETOOTH
SECURE_ELEMENT
SAM_SLOT
```

L’application ne doit afficher ou activer que les fonctions réellement disponibles et autorisées.

## 8. Enregistrement initial

Un terminal peut entrer dans le parc par :

- import fournisseur ;
- import CSV/ERP ;
- scan du numéro de série ;
- API partenaire ;
- saisie manuelle contrôlée ;
- auto-enrôlement supervisé.

L’enregistrement initial ne doit pas suffire à autoriser des transactions financières.

## 9. Enrôlement sécurisé

Le flux recommandé est :

```text
Terminal connu dans l’inventaire
→ challenge d’enrôlement court
→ preuve d’identité matérielle/logicielle disponible
→ vérification environnement
→ création ou installation d’un certificat terminal
→ association organisation/site
→ récupération de politique initiale
→ activation
```

Les codes d’enrôlement doivent être à durée de vie courte, usage unique et liés à un terminal ou une opération précise.

## 10. Attestation du terminal

Lorsque la plateforme ou le fabricant le permet, Mansa doit exploiter une attestation permettant de vérifier :

- intégrité du système ;
- boot sécurisé ;
- état root/jailbreak ;
- application signée ;
- version minimale ;
- certificat matériel ;
- environnement non émulé lorsqu’exigé ;
- état du secure element.

L’absence d’une technologie d’attestation particulière ne doit pas empêcher l’intégration d’un fabricant ; une politique de confiance adaptée doit être appliquée.

## 11. Certificats et authentification machine

Les terminaux sensibles doivent pouvoir utiliser des certificats individuels.

Exigences :

- certificat unique par appareil ;
- durée configurable ;
- rotation ;
- révocation ;
- renouvellement sécurisé ;
- association stricte `deviceId ↔ certificat` ;
- validation serveur ;
- mTLS lorsque le niveau de risque l’exige.

Aucun certificat privé de production ne doit être partagé entre un parc complet de terminaux.

## 12. Affectation

Un terminal peut être affecté à :

- commerçant ;
- boutique ;
- agent ;
- entreprise ;
- administration ;
- ministère ;
- site ;
- caisse ;
- véhicule ;
- péage ;
- voie ;
- technicien temporaire.

Toute affectation ou réaffectation doit produire un événement d’audit.

## 13. États du cycle de vie

États recommandés :

```text
REGISTERED
PENDING_ENROLLMENT
ENROLLED
ACTIVE
DEGRADED
SUSPENDED
LOST
STOLEN
COMPROMISED
MAINTENANCE
RETIRED
WIPED
ARCHIVED
```

Les transitions doivent être contrôlées et historisées.

## 14. Politique de configuration

Les paramètres ne doivent pas être codés en dur appareil par appareil.

Une politique peut cibler :

- pays ;
- organisation ;
- type de terminal ;
- modèle ;
- site ;
- rôle ;
- version applicative ;
- niveau de risque ;
- canal.

La résolution doit produire une configuration effective déterministe et auditable.

## 15. Paramètres configurables

Exemples :

- langues ;
- devise ;
- moyens de paiement activés ;
- Mobile Money activé/désactivé ;
- plafonds ;
- mode hors ligne ;
- durée de session ;
- timeout ;
- imprimante ;
- reçu ;
- QR ;
- règles de synchronisation ;
- niveau de logs ;
- version minimale obligatoire ;
- canaux de support.

Les paramètres financiers ou réglementaires doivent être versionnés avec date d’effet.

## 16. Feature flags terminal

Le moteur de feature flags Mansa doit pouvoir cibler les terminaux sans dupliquer sa logique.

Exemples :

```text
feature.card_payment
feature.mansa_qr
feature.mobile_money
feature.cash_acceptance
feature.rfid
feature.anpr
feature.offline_payments
```

Un rollback doit pouvoir désactiver rapidement une fonction présentant un risque.

## 17. Télécommandes

Commandes autorisées selon rôle :

```text
PING
SYNC_CONFIG
SYNC_TIME
REFRESH_CERTIFICATE
REFRESH_KEYS_REFERENCE
RESTART_APP
REBOOT_DEVICE
LOCK_DEVICE
UNLOCK_DEVICE
DISABLE_PAYMENTS
START_DIAGNOSTIC
UPLOAD_LOG_BUNDLE
INSTALL_APPROVED_UPDATE
FACTORY_RESET_REQUEST
SECURE_WIPE_REQUEST
```

Les commandes sensibles doivent nécessiter un niveau d’autorisation adapté et parfois une double validation.

## 18. Sécurité des commandes distantes

Chaque commande doit comporter :

- identifiant unique ;
- terminal ciblé ;
- auteur ;
- motif ;
- timestamp ;
- date d’expiration ;
- signature/intégrité ;
- statut ;
- résultat ;
- code erreur ;
- preuve d’exécution si disponible.

Une commande expirée ne doit jamais être rejouée automatiquement.

## 19. Mise à jour logicielle

Une release doit contenir :

- version ;
- canal ;
- hash ;
- signature ;
- compatibilité modèles ;
- version OS minimale ;
- notes de version ;
- criticité ;
- stratégie de rollback ;
- date de publication.

Le terminal doit vérifier l’intégrité avant installation.

## 20. Campagnes de déploiement

Stratégies minimales :

```text
INTERNAL
CANARY
PILOT
PHASED_ROLLOUT
FULL_ROLLOUT
EMERGENCY
ROLLBACK
```

Une campagne peut cibler un pourcentage, un site, un modèle ou une population précise.

## 21. Conditions de déploiement

Avant installation :

- batterie suffisante ;
- alimentation secteur si requise ;
- espace disque ;
- réseau compatible ;
- version de base compatible ;
- absence de transaction active ;
- fenêtre de maintenance respectée.

Un terminal de péage ne doit pas redémarrer au milieu d’une transaction ou d’un passage véhicule.

## 22. Rollback

Une mise à jour défaillante doit pouvoir être :

- interrompue ;
- suspendue globalement ;
- limitée au canary ;
- rollbackée vers une version approuvée lorsque la plateforme le permet ;
- compensée par désactivation d’une feature si le rollback binaire n’est pas possible.

Le portail doit montrer le nombre de terminaux affectés.

## 23. Inventaire logiciel

Pour chaque terminal :

- OS ;
- niveau patch sécurité ;
- application Mansa ;
- composants critiques ;
- firmware ;
- drivers ;
- SDK fabricant ;
- packages approuvés ;
- date de dernière mise à jour.

Les composants interdits ou obsolètes doivent pouvoir déclencher une alerte.

## 24. Télémétrie

Le terminal peut remonter :

- disponibilité ;
- dernière connexion ;
- CPU/mémoire selon pertinence ;
- batterie ;
- température ;
- stockage ;
- réseau ;
- opérateur mobile ;
- version ;
- état imprimante ;
- état lecteur carte ;
- état NFC ;
- état scanner ;
- état périphériques espèces ;
- erreurs matérielles ;
- compteur de redémarrages.

La collecte doit rester proportionnée et respecter la minimisation des données.

## 25. Health score

Mansa peut calculer un score technique à partir de :

- connectivité ;
- fraîcheur de version ;
- intégrité ;
- erreurs ;
- périphériques indisponibles ;
- batterie ;
- stockage ;
- incidents récents.

États :

```text
HEALTHY
WARNING
DEGRADED
CRITICAL
OFFLINE
UNKNOWN
```

## 26. Fonctionnement hors ligne

Le terminal doit pouvoir conserver localement uniquement les éléments nécessaires autorisés par sa politique :

- configuration minimale signée ;
- tables de référence limitées ;
- autorisations temporaires ;
- transactions en attente ;
- journal local protégé ;
- files de synchronisation.

Au retour du réseau :

- synchronisation idempotente ;
- déduplication ;
- contrôle d’ordre ;
- détection de conflits ;
- aucune double transaction ;
- remontée des incidents hors ligne.

## 27. Données locales sensibles

Les données locales doivent être :

- minimisées ;
- chiffrées lorsque nécessaire ;
- protégées par le stockage sécurisé de la plateforme ;
- supprimées après synchronisation selon politique ;
- inaccessibles aux autres applications ;
- non incluses en clair dans les logs.

PIN carte, CVV et secrets bancaires ne doivent jamais être stockés par l’application Mansa.

## 28. Terminaux de paiement

Pour les TPE :

- Mansa orchestre l’expérience et les règles autorisées ;
- les fonctions EMV et PIN doivent être assurées par les composants/SDK certifiés applicables ;
- l’application ne doit pas contourner les contrôles du terminal ;
- les réseaux acceptés dépendent de l’acquéreur et des contrats activés ;
- Visa et Mastercard peuvent être supportés lorsque contractuellement disponibles sans promettre toutes les cartes du monde.

## 29. Bornes de péage

Les décisions de référence suivantes sont obligatoires :

- coexistence d’un péage automatique classique avec barrière et d’un télépéage RFID avec barrière ;
- évolution ultérieure possible vers free-flow sans supprimer ces deux architectures ;
- paiement classique configurable : billets et pièces FCFA, carte EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money ;
- Mobile Money activable/désactivable par administration au niveau national, réseau, poste ou voie, avec date d’effet et audit ;
- télépéage initial par tags UHF RFID passifs associés au véhicule et au compte ;
- lecteur/antenne, contrôleur local, relais `OPEN`, barrière et capteurs ;
- matériel multi-fournisseurs derrière adaptateurs ;
- entrée relais/contact sec ou interface industrielle documentée ;
- fonctionnement local/hors ligne sans double débit ;
- trois niveaux d’équipement : automatique complet, semi-automatique sécurisé et poste numérisé à faible coût ;
- déploiement progressif ;
- matériel acheté par l’État/concessionnaire ou fourni/intégré/revendu par Mansa ;
- marque blanche État/concessionnaire avec mention `Propulsé par Mansa` facultative ;
- rapprochement anti-corruption entre véhicule, catégorie, tarif, paiement, ouverture et passage physique ;
- toute ouverture manuelle auditée.

## 30. Compatibilité multi-fournisseurs

Abstractions recommandées :

```text
DeviceManagementProvider
TerminalManufacturerProvider
MobileDeviceManagementProvider
PaymentTerminalProvider
KioskProvider
PrinterProvider
ScannerProvider
RFIDReaderProvider
ANPRProvider
LaneControllerProvider
```

Un constructeur doit être remplaçable sans modifier les règles métier principales.

## 31. Adaptateurs fabricants

Chaque adaptateur doit exposer si disponible :

- inventaire ;
- identité ;
- télémétrie ;
- commandes ;
- mises à jour ;
- logs ;
- état ;
- capacités ;
- certificats ;
- erreurs normalisées.

Les fonctions non supportées doivent être déclarées explicitement.

## 32. Perte ou vol

Lorsqu’un terminal est déclaré perdu ou volé :

```text
ACTIVE
→ LOST/STOLEN
→ révocation certificats/tokens
→ blocage transactions
→ tentative de lock distant
→ effacement distant si autorisé et possible
→ alerte sécurité
→ audit
```

La réactivation doit être une procédure distincte et contrôlée.

## 33. Terminal compromis

Signaux possibles :

- root/jailbreak ;
- attestation invalide ;
- certificat cloné ;
- application modifiée ;
- version interdite ;
- comportement réseau anormal ;
- identifiant matériel incohérent ;
- tentatives de rejeu ;
- utilisation simultanée impossible.

Actions configurables : quarantaine, restriction, blocage paiement, ré-enrôlement ou investigation.

## 34. Maintenance

Une fiche maintenance doit enregistrer :

- panne ;
- diagnostic ;
- technicien ;
- pièces remplacées ;
- date ;
- durée ;
- logiciel installé ;
- tests de recette ;
- état avant/après ;
- preuve de retour en service.

## 35. RMA et remplacement

Le remplacement doit préserver l’historique sans transférer automatiquement les secrets.

Flux :

```text
ancien terminal suspendu
→ clôture des sessions
→ révocation des credentials
→ nouveau terminal enregistré
→ nouvel enrôlement
→ réaffectation métier contrôlée
→ validation
```

## 36. Stock et entrepôt

Le portail doit pouvoir distinguer :

```text
IN_STOCK
ALLOCATED
IN_TRANSIT
DEPLOYED
RETURNED
REPAIR
QUARANTINE
RETIRED
```

Les mouvements physiques doivent être audités.

## 37. Portail d’administration

Menus recommandés :

```text
Device Management
├── Parc
├── Modèles
├── Constructeurs
├── Affectations
├── Enrôlements
├── Politiques
├── Configurations
├── Releases
├── Campagnes
├── Commandes
├── Santé
├── Alertes
├── Maintenance
├── Stock
├── Incidents
└── Audit
```

## 38. Recherche et filtres

Filtres :

- organisation ;
- pays ;
- site ;
- modèle ;
- état ;
- version ;
- health score ;
- dernière connexion ;
- affectation ;
- capacité ;
- incident ;
- campagne.

## 39. Alertes

Exemples :

- terminal hors ligne trop longtemps ;
- version critique obsolète ;
- certificat proche expiration ;
- attestation échouée ;
- batterie ou température critique ;
- périphérique paiement indisponible ;
- imprimante en panne ;
- tentative d’usage après révocation ;
- divergence de configuration ;
- campagne de mise à jour en échec.

## 40. RBAC et séparation des rôles

Rôles possibles :

```text
DEVICE_VIEWER
DEVICE_OPERATOR
DEVICE_TECHNICIAN
DEVICE_ADMIN
SECURITY_ADMIN
RELEASE_MANAGER
AUDITOR
```

Pouvoirs séparables :

- enregistrer ;
- affecter ;
- suspendre ;
- envoyer commande ;
- lancer mise à jour ;
- approuver release ;
- effacer ;
- consulter logs ;
- exporter ;
- gérer certificats.

Un technicien terrain ne doit pas disposer automatiquement des droits financiers ou d’administration globale.

## 41. Audit

Événements obligatoires :

- création terminal ;
- enrôlement ;
- affectation ;
- changement de politique ;
- commande distante ;
- mise à jour ;
- rollback ;
- suspension ;
- révocation ;
- lock/wipe ;
- maintenance ;
- remplacement ;
- changement de certificat ;
- accès administratif sensible.

Les journaux doivent être protégés contre les modifications non autorisées.

## 42. Confidentialité

Le moteur ne doit pas devenir un outil de surveillance des employés ou usagers.

Les données techniques collectées doivent être limitées au besoin opérationnel, sécurité, maintenance, fraude et conformité. Les données de localisation persistantes doivent être désactivables et justifiées par l’usage.

## 43. API internes

Exemples :

```text
POST /devices/enroll
GET /devices/{id}
POST /devices/{id}/assign
POST /devices/{id}/suspend
POST /devices/{id}/commands
GET /devices/{id}/health
GET /devices/{id}/configuration
POST /device-releases
POST /device-update-campaigns
```

Toutes les routes doivent appliquer authentification, autorisation et contexte tenant.

## 44. Webhooks et événements

Événements possibles :

```text
device.enrolled
device.activated
device.offline
device.health_degraded
device.compromised
device.suspended
device.assignment_changed
device.update_started
device.update_failed
device.update_completed
device.certificate_expiring
```

Les événements externes doivent respecter les règles de signature et de sécurité des webhooks Mansa.

## 45. Tests obligatoires

Le module doit inclure des tests sur :

- enrôlement invalide ;
- code expiré ;
- certificat révoqué ;
- terminal suspendu ;
- terminal d’un autre tenant ;
- commande expirée ;
- rejeu de commande ;
- rollback de release ;
- mise à jour partielle ;
- perte réseau ;
- resynchronisation ;
- double événement ;
- perte/vol ;
- root/attestation négative lorsque supportée ;
- permissions administratives ;
- impossibilité de double débit hors ligne.

## 46. Observabilité

Métriques minimales :

- terminaux actifs ;
- terminaux hors ligne ;
- taux d’enrôlement ;
- erreurs d’enrôlement ;
- versions déployées ;
- taux succès mises à jour ;
- temps moyen de mise à jour ;
- certificats expirant ;
- incidents par modèle ;
- taux de périphériques dégradés ;
- commandes distantes réussies/échouées.

## 47. SLA opérationnels

Les SLA doivent être configurables par type de matériel, contrat et criticité.

Exemples de classes :

```text
STANDARD
BUSINESS_CRITICAL
PAYMENT_CRITICAL
STATE_CRITICAL
TOLL_CRITICAL
```

Le SLA ne doit pas être codé en dur dans le moteur.

## 48. Décommissionnement

Avant retrait définitif :

1. bloquer les nouvelles opérations ;
2. synchroniser les files restantes ;
3. clôturer les sessions ;
4. révoquer certificats et tokens ;
5. supprimer les données locales selon politique ;
6. confirmer l’effacement si supporté ;
7. retirer l’affectation ;
8. changer l’état en `RETIRED/WIPED` ;
9. conserver l’historique d’audit.

## 49. Critères d’acceptation

Le module est considéré prêt lorsque :

- chaque terminal possède une identité et un état ;
- les affectations sont auditables ;
- les configurations sont versionnées ;
- les secrets ne sont pas partagés en clair ;
- un terminal perdu ou compromis peut être révoqué ;
- les mises à jour peuvent être déployées progressivement ;
- un rollback ou une désactivation d’urgence existe ;
- la télémétrie permet de diagnostiquer les pannes essentielles ;
- l’isolation multi-tenant est testée ;
- les opérations hors ligne restent idempotentes ;
- les constructeurs sont intégrés via adaptateurs ;
- les exigences péage de référence restent compatibles avec ce moteur.

## 50. Règle finale

Le parc matériel Mansa doit pouvoir croître de quelques terminaux de démonstration à des dizaines ou centaines de milliers d’équipements sans transformer chaque modèle constructeur en produit séparé.

La logique métier reste dans Mansa ; les différences de matériel sont contenues dans les adaptateurs, politiques, capacités et couches de gestion de terminaux.
