# Cahier des charges — Distributeurs automatiques, retraits et accès aux espèces

## 1. Objet

Ce document définit les exigences Mansa relatives aux distributeurs automatiques de billets, aux bornes de retrait, aux retraits assistés par agent et aux mécanismes d’accès aux espèces depuis un wallet, une carte ou un compte Mansa.

Le domaine doit permettre un déploiement progressif au Mali puis dans d’autres pays, avec plusieurs modèles matériels et plusieurs partenaires financiers, sans dépendre d’un seul fabricant ni d’un seul réseau carte.

L’objectif est de rendre le retrait d’espèces sûr, auditable, résilient, configurable et compatible avec les contraintes d’infrastructure, de connectivité et de disponibilité de cash locales.

## 2. Principes directeurs

Mansa doit respecter les principes suivants :

1. aucun distributeur ne doit débiter définitivement un client si les billets n’ont pas été délivrés ou si la délivrance n’est pas confirmée ;
2. toute opération de retrait doit être idempotente et rapprochable ;
3. le matériel doit être abstrait derrière des adaptateurs multi-fournisseurs ;
4. aucun PIN carte ou secret d’authentification ne doit être journalisé ;
5. les montants, frais, limites, commissions et canaux autorisés doivent être configurables ;
6. les opérations hors ligne doivent rester limitées à des scénarios explicitement autorisés et ne jamais permettre un double débit ;
7. le cash physique doit être suivi comme une ressource comptable distincte du solde numérique ;
8. les cassettes, chargements, collectes, écarts et incidents doivent être auditables ;
9. un retrait refusé ou interrompu doit produire un état final explicite ;
10. les composants critiques de sécurité ne doivent pas dépendre uniquement de l’interface cliente ;
11. les distributeurs Mansa doivent pouvoir fonctionner avec des cartes Mansa, des cartes bancaires compatibles via l’acquéreur et, lorsque prévu, avec un retrait sans carte ;
12. le système ne doit jamais prétendre accepter toutes les cartes du monde : il accepte uniquement les réseaux et produits activés par l’acquéreur et les partenaires ;
13. les règles de conformité, fraude et limites doivent être évaluées avant autorisation ;
14. la maintenance distante ne doit jamais permettre de contourner les politiques d’accès ou l’audit ;
15. les appareils doivent être désactivables à distance en cas de compromission, vol ou anomalie critique.

## 3. Périmètre fonctionnel

Le domaine couvre au minimum :

```text
ATM_WITHDRAWAL
CARD_WITHDRAWAL
MANSA_CARD_WITHDRAWAL
CARDLESS_WITHDRAWAL
WALLET_CASH_OUT
QR_CASH_OUT
ONE_TIME_WITHDRAWAL_CODE
AGENT_CASH_OUT
ATM_CASH_IN_FUTURE
ATM_BALANCE_INQUIRY
ATM_RECEIPT
ATM_DEVICE_MANAGEMENT
ATM_CASSETTE_MANAGEMENT
ATM_CASH_LOADING
ATM_CASH_COLLECTION
ATM_RECONCILIATION
ATM_DISPUTE
ATM_REVERSAL
ATM_FEE_POLICY
ATM_LIMIT_POLICY
ATM_MONITORING
ATM_REMOTE_MAINTENANCE
ATM_OFFLINE_DEGRADED_MODE
```

Le dépôt d’espèces automatique peut être ajouté ultérieurement sans être requis pour le premier distributeur.

## 4. Canaux de retrait

Mansa doit pouvoir supporter plusieurs parcours :

### 4.1 Retrait avec carte Mansa

```text
carte insérée ou présentée
-> lecture carte
-> authentification requise
-> choix montant
-> contrôle limites et risque
-> autorisation
-> préparation des billets
-> distribution
-> confirmation capteur
-> écriture ledger finale
-> reçu / notification
```

### 4.2 Retrait avec carte bancaire externe

Le terminal doit utiliser le flux acquéreur et les réseaux activés contractuellement, notamment Visa et Mastercard lorsqu’ils sont disponibles.

Mansa ne doit pas stocker les données sensibles carte au-delà de ce qui est autorisé par l’architecture et les obligations applicables.

### 4.3 Retrait sans carte

Mansa peut supporter :

```text
QR dynamique
code de retrait à usage unique
ordre de retrait préparé dans l’application
NFC wallet lorsque supporté
identification agent + code client
```

Le code de retrait doit être :

- à usage unique ;
- limité dans le temps ;
- lié à un montant ou à une plage autorisée ;
- lié à un bénéficiaire lorsque nécessaire ;
- invalidé immédiatement après succès ;
- protégé contre les tentatives répétées.

## 5. Entités recommandées

```text
AtmDevice
AtmSite
AtmOperator
AtmTerminalProfile
AtmCashCassette
AtmCassetteSlot
AtmCashLoad
AtmCashCollection
AtmCashInventory
AtmWithdrawal
AtmWithdrawalAuthorization
AtmWithdrawalAttempt
AtmCashDispense
AtmCashDispenseResult
AtmReversal
AtmReceipt
AtmFeePolicy
AtmLimitPolicy
AtmRoutingPolicy
AtmHealthEvent
AtmIncident
AtmMaintenanceSession
AtmReconciliation
AtmDiscrepancy
AtmDispute
CardlessWithdrawalOrder
OneTimeWithdrawalToken
CashOutCommission
AuditLog
```

Chaque entité doit inclure le contexte d’organisation, pays, devise, site et appareil lorsque pertinent.

## 6. États d’un retrait

États recommandés :

```text
CREATED
AUTHENTICATING
AUTHORIZED
DECLINED
DISPENSE_REQUESTED
DISPENSING
DISPENSED
PARTIALLY_DISPENSED
CASH_NOT_TAKEN
DISPENSE_FAILED
REVERSAL_PENDING
REVERSED
COMPLETED
DISPUTED
CANCELLED
```

Les transitions doivent être contrôlées par machine d’état.

## 7. Principe de débit conditionné à la délivrance

La conception doit éviter qu’un client perde son argent si le distributeur ne délivre pas les billets.

Le flux recommandé est :

```text
1. autorisation / réservation du montant
2. demande de distribution physique
3. confirmation par capteurs du résultat
4. capture comptable si délivrance réussie
5. reversal ou libération si échec
```

Si le réseau ou le partenaire impose un autre modèle, Mansa doit conserver un workflow de compensation et de reversal explicite.

## 8. Distribution partielle

Le matériel peut exceptionnellement distribuer un montant différent du montant demandé.

Dans ce cas :

- le montant réellement délivré doit être mesuré ;
- l’événement doit être marqué `PARTIALLY_DISPENSED` ;
- le ledger ne doit comptabiliser que le montant effectivement dû selon le résultat confirmé ;
- une alerte opérationnelle doit être créée ;
- un rapprochement de cassette doit être déclenché ;
- le client doit recevoir une information claire ;
- le dossier doit rester contestable.

## 9. Cash non récupéré

Si les billets sont présentés mais non pris dans le délai matériel :

```text
CASH_PRESENTED
-> timeout
-> RETRACTED_BY_DEVICE
```

Le système doit distinguer :

- billets pris ;
- billets rétractés ;
- statut inconnu ;
- capteur incohérent.

Le traitement financier dépend du résultat réel et de la politique partenaire.

## 10. Gestion des cassettes

Chaque cassette doit être identifiée individuellement.

Champs recommandés :

```text
cassetteId
serialNumber
deviceId
slotNumber
denomination
currency
loadedQuantity
currentEstimatedQuantity
countedQuantity
status
sealNumber?
loadedAt
loadedBy
removedAt?
removedBy?
```

Une cassette ne doit pas changer de coupure sans procédure contrôlée.

## 11. Coupures FCFA / XOF

Le distributeur déployé au Mali doit être explicitement validé pour les billets XOF concernés.

La liste réelle des coupures supportées dépend :

- du modèle de cassette ;
- du distributeur ;
- du firmware ;
- du fournisseur ;
- de la configuration opérationnelle ;
- des séries de billets en circulation.

Mansa ne doit jamais supposer qu’un distributeur configuré pour EUR ou USD fonctionne automatiquement en XOF.

## 12. Algorithme de composition des billets

Pour un retrait, le distributeur peut choisir la combinaison selon :

```text
montant demandé
coupures disponibles
quantité disponible par cassette
seuil de réserve
politique de priorité
nombre maximum de billets
préférence éventuelle du client
```

La politique doit pouvoir éviter d’épuiser inutilement une seule cassette.

## 13. Inventaire cash

Mansa doit maintenir une estimation temps réel du cash :

```text
cashLoaded
- cashDispensedConfirmed
- cashRetractedUnresolved
- cashRemoved
+ manualCorrectionApproved
= expectedCash
```

Le cash physique compté reste la source de vérité lors du rapprochement final.

## 14. Chargement de cash

Un chargement doit suivre un workflow contrôlé :

1. création de mission ;
2. identification du site et du distributeur ;
3. authentification des personnes habilitées ;
4. ouverture sécurisée ;
5. retrait ou insertion des cassettes ;
6. scan des identifiants ;
7. saisie ou import des montants ;
8. double contrôle si activé ;
9. scellement ;
10. remise en service ;
11. journal d’audit.

## 15. Séparation des tâches

Le système doit permettre d’imposer :

```text
PREPARER != TRANSPORTER
TRANSPORTER != VALIDER_COMPTAGE
TECHNICIEN != APPROUVER_AJUSTEMENT_FINANCIER
```

Une seule personne ne doit pas pouvoir modifier silencieusement l’inventaire physique et le rapprochement comptable lorsque la séparation des tâches est activée.

## 16. Transport de fonds

Mansa doit pouvoir enregistrer :

- mission ;
- prestataire ;
- agents ;
- heure de prise en charge ;
- sacs/cassettes/scellés ;
- chaîne de responsabilité ;
- anomalies ;
- réception ;
- preuve de comptage.

Le produit doit rester compatible avec plusieurs sociétés de transport de fonds.

## 17. Frais client

Les frais peuvent être configurés par :

```text
pays
réseau
carte Mansa / externe
site
type de distributeur
montant
segment client
abonnement
partenaire
```

Les frais doivent être affichés avant confirmation lorsque requis.

Aucun frais ne doit être caché dans le montant retiré.

## 18. Commissions et partage de revenus

Le moteur doit pouvoir répartir les revenus entre :

- Mansa ;
- banque partenaire ;
- acquéreur ;
- opérateur du distributeur ;
- propriétaire du site ;
- agent ou prestataire lorsque applicable.

Le partage doit utiliser le moteur de tarification et de commissions existant, sans duplication de logique.

## 19. Limites de retrait

Les limites doivent être configurables :

```text
par transaction
par heure
par jour
par semaine
par mois
par compte
par carte
par appareil
par site
par pays
par niveau KYC
```

Le contrôle doit être effectué côté serveur.

## 20. Contrôle fraude

Signaux recommandés :

- retraits répétés en courte période ;
- montants juste sous les limites ;
- changement inhabituel de localisation ;
- plusieurs cartes sur un même appareil ;
- plusieurs échecs PIN ;
- appareil signalé compromis ;
- carte nouvelle + retrait élevé ;
- compte récemment récupéré ;
- retrait peu après changement d’appareil ;
- retrait sans carte anormalement fréquent ;
- tentative de réutilisation d’un code ;
- incohérence entre autorisation et capteurs de distribution.

Les règles alimentent le risk engine Mansa existant.

## 21. Authentification

Selon le canal, Mansa peut utiliser :

```text
PIN carte géré par l’environnement paiement approprié
code de retrait à usage unique
validation dans l’application
biométrie sur l’appareil personnel
OTP lorsque autorisé
contrôle renforcé pour opérations à risque
```

Un PIN bancaire ne doit jamais être transmis à l’application métier Mansa en clair.

## 22. Sécurité physique

Le distributeur doit pouvoir intégrer :

- coffre sécurisé ;
- capteurs d’ouverture ;
- détection d’arrachement ;
- détection de porte ;
- alarme ;
- caméra externe selon politique et droit applicable ;
- lecteur anti-skimming lorsque supporté ;
- protections contre insertion frauduleuse ;
- journal matériel signé ;
- batterie/UPS si disponible.

## 23. Skimming et compromission lecteur

Les événements de sécurité doivent pouvoir déclencher :

```text
DEVICE_WARNING
READER_SUSPECTED
DEVICE_QUARANTINED
WITHDRAWALS_DISABLED
MAINTENANCE_REQUIRED
```

Un appareil mis en quarantaine ne doit plus effectuer de retrait jusqu’à validation autorisée.

## 24. Chiffrement et clés

Les clés de paiement et clés matérielles doivent utiliser l’infrastructure cryptographique/HSM définie dans la documentation Mansa.

Aucune clé de production ne doit être stockée dans Git, les logs applicatifs, une configuration locale ou l’interface d’administration.

## 25. Multi-fournisseurs

Mansa doit exposer une abstraction :

```text
AtmHardwareProvider
CashDispenserAdapter
CardReaderAdapter
PinPadAdapter
ReceiptPrinterAdapter
CashSensorAdapter
DeviceHealthAdapter
```

Le domaine métier ne doit pas dépendre directement d’un SDK constructeur.

## 26. Protocoles et intégrations

Selon le matériel :

```text
API constructeur
SDK
ISO 8583 via switch partenaire
NDC / DDC lorsque pertinent
TCP/IP
VPN
serial / USB interne
interface industrielle documentée
```

Le choix du protocole dépend du fournisseur et de l’architecture bancaire partenaire.

## 27. Routing financier

Le retrait doit être routé selon :

- carte Mansa ;
- carte bancaire partenaire ;
- réseau externe ;
- wallet Mansa ;
- ordre sans carte ;
- pays ;
- disponibilité fournisseur ;
- politiques de coût et résilience.

Le routeur doit éviter toute double soumission lors d’un failover.

## 28. Idempotence

Chaque retrait possède un identifiant stable.

Une nouvelle tentative technique ne doit jamais créer un second débit.

Les appels sensibles doivent supporter :

```text
idempotencyKey
withdrawalId
deviceTransactionId
partnerReference
networkReference
```

## 29. Réseau instable

Si la connexion tombe après autorisation, le distributeur doit conserver un état local minimal permettant de savoir si la distribution a été demandée ou exécutée.

Au retour réseau :

- reprise contrôlée ;
- interrogation du statut partenaire ;
- interrogation du résultat matériel ;
- rapprochement ;
- reversal si nécessaire ;
- aucun nouveau débit automatique pour la même opération.

## 30. Mode hors ligne

Par défaut, un retrait financier nécessitant une autorisation distante ne doit pas être inventé localement.

Un mode hors ligne limité peut exister uniquement si un partenaire autorise explicitement des limites locales sécurisées.

Il doit alors inclure :

- plafond très limité ;
- listes d’autorisation signées ;
- journal local inviolable ou protégé ;
- compteur de risque ;
- expiration ;
- synchronisation obligatoire ;
- blocage après dépassement de seuil.

## 31. Reçus

Le reçu peut être :

```text
PRINTED
DIGITAL
EMAIL
SMS_LINK
APP_NOTIFICATION
NONE
```

Le reçu ne doit pas afficher de données carte sensibles complètes.

## 32. Interface utilisateur distributeur

L’interface doit être simple, lisible et utilisable en conditions extérieures.

Elle doit prévoir :

- français ;
- bamanankan ;
- anglais ;
- langues supplémentaires configurables ;
- gros boutons ;
- contraste élevé ;
- délai d’inactivité ;
- annulation visible ;
- messages courts ;
- assistance ;
- accessibilité selon matériel disponible.

Le branding doit être personnalisable pour Mansa, banque partenaire, État, entreprise ou exploitant.

## 33. Retrait sans carte préparé dans l’application

Flux recommandé :

```text
client choisit montant dans l’app
-> contrôles risque et limites
-> création CardlessWithdrawalOrder
-> génération token/QR à usage unique
-> arrivée au distributeur
-> présentation du token
-> contrôle serveur
-> distribution
-> confirmation physique
-> finalisation ledger
```

Le token ne doit jamais contenir directement un secret financier réutilisable.

## 34. Retrait pour un bénéficiaire tiers

Une fonctionnalité future peut permettre d’envoyer un retrait à une autre personne.

Le système doit gérer :

- donneur d’ordre ;
- bénéficiaire ;
- montant ;
- expiration ;
- règles KYC ;
- tentatives ;
- révocation ;
- notification ;
- preuve de retrait.

## 35. Retrait via agent

Le retrait agent utilise le réseau agents existant.

Il doit vérifier :

```text
solde client
float agent
cash disponible déclaré
limites
commission
identité / authentification
risque
```

Le retrait agent et le retrait ATM doivent utiliser la même sémantique financière de cash-out lorsque possible.

## 36. Distributeur propriété Mansa

Si Mansa achète ou exploite un distributeur, le système doit gérer :

- inventaire matériel ;
- localisation ;
- assurance ;
- maintenance ;
- connectivité ;
- chargement cash ;
- disponibilité ;
- coût par opération ;
- prestataires ;
- pièces détachées ;
- historique incidents.

## 37. Distributeur partenaire

Si le distributeur appartient à une banque ou un tiers, Mansa doit pouvoir intégrer le réseau sans prendre la responsabilité opérationnelle du cash lorsque le contrat ne le prévoit pas.

Le rôle contractuel doit être représenté dans la configuration.

## 38. Modèles commerciaux

Mansa doit supporter :

```text
OWNED_BY_MANSA
OWNED_BY_BANK
OWNED_BY_STATE
OWNED_BY_MERCHANT
OWNED_BY_OPERATOR
LEASED
MANAGED_SERVICE
REVENUE_SHARE
```

## 39. Télémaintenance

La télémaintenance peut inclure :

- redémarrage applicatif ;
- récupération métriques ;
- changement de configuration non sensible ;
- mise à jour signée ;
- diagnostic ;
- désactivation fonctionnelle.

Elle ne doit jamais permettre de déclencher arbitrairement une sortie de billets sans workflow métier et autorisation appropriée.

## 40. Mise à jour logicielle

Les mises à jour doivent être :

- signées ;
- versionnées ;
- auditables ;
- déployées par vagues ;
- annulables ;
- compatibles avec un mode maintenance.

Un échec de mise à jour ne doit pas rendre le cash incontrôlable.

## 41. Supervision

Métriques recommandées :

```text
availability
cashLevelByCassette
withdrawalSuccessRate
dispenseFailureRate
reversalRate
cashRetractRate
readerErrors
printerErrors
networkLatency
partnerLatency
deviceTemperature
doorEvents
maintenanceState
```

## 42. Alertes

Alertes prioritaires :

- cash faible ;
- cassette vide ;
- cassette incohérente ;
- distributeur hors ligne ;
- taux d’échec élevé ;
- porte ouverte ;
- suspicion de fraude ;
- capteur de distribution incohérent ;
- imprimante bloquée ;
- lecteur carte indisponible ;
- température anormale ;
- batterie faible ;
- erreur partenaire prolongée.

## 43. Rapprochement

Le rapprochement doit comparer :

```text
retraits autorisés
retraits comptabilisés
billets physiquement délivrés
inventaire cassette attendu
inventaire cassette compté
références partenaire
reversals
litiges
```

Tout écart doit créer un dossier explicite.

## 44. Écart de cash

Types :

```text
SHORTAGE
OVERAGE
UNKNOWN_DISPENSE
PARTIAL_DISPENSE
CASSETTE_COUNT_MISMATCH
RETRACT_MISMATCH
MANUAL_ADJUSTMENT
```

Un ajustement manuel doit contenir auteur, motif, preuve et approbation selon seuil.

## 45. Litiges client

Le support doit retrouver :

- retrait ;
- appareil ;
- heure ;
- autorisation ;
- résultat capteurs ;
- référence réseau ;
- reversal ;
- inventaire de cassette ;
- incident matériel ;
- notification client.

Le support ne doit pas avoir accès aux secrets de paiement.

## 46. Cas « débité mais pas servi »

Ce scénario doit être traité en priorité.

Le système doit automatiquement :

1. comparer autorisation et résultat distributeur ;
2. identifier l’absence de délivrance confirmée ;
3. déclencher reversal/libération selon le rail ;
4. notifier le client ;
5. ouvrir un incident si le statut reste ambigu ;
6. empêcher une seconde compensation pour le même retrait.

## 47. Cas « billets servis mais débit incertain »

Le système doit éviter de perdre l’information physique.

L’événement matériel doit être conservé jusqu’au rapprochement partenaire.

Toute régularisation doit être auditée.

## 48. Données personnelles

Le domaine applique la politique de confidentialité Mansa :

- minimisation ;
- conservation limitée ;
- accès selon rôle ;
- journalisation ;
- export lorsque applicable ;
- suppression/anonymisation après obligations de conservation.

## 49. Caméras

Si une caméra est installée :

- finalité définie ;
- durée de conservation configurable ;
- accès très restreint ;
- aucune capture du PIN ;
- conformité au droit local ;
- signalétique si requise.

## 50. Audit

Événements à auditer :

```text
device activation
device disablement
cassette insert/remove
cash load
cash collection
maintenance login
configuration change
withdrawal authorization
cash dispense
reversal
manual adjustment
dispute resolution
remote command
software update
```

## 51. RBAC

Rôles possibles :

```text
ATM_OPERATOR
ATM_CASH_MANAGER
ATM_TECHNICIAN
ATM_SUPERVISOR
FINANCE_RECONCILIATION
RISK_ANALYST
SUPPORT_AGENT
SECURITY_AUDITOR
SYSTEM_ADMIN
```

Le technicien matériel ne doit pas automatiquement disposer du droit d’ajuster les comptes financiers.

## 52. Multi-tenant

Chaque distributeur est rattaché à une organisation opérationnelle.

Un opérateur ne doit voir que les appareils, cassettes, transactions et incidents autorisés pour son périmètre.

## 53. Multi-pays et multi-devise

Le système doit pouvoir gérer :

```text
XOF
EUR
USD
et autres devises activées ultérieurement
```

Les cassettes sont toujours liées à une seule devise et une seule coupure à un instant donné.

## 54. Disponibilité des billets

Avant de proposer un montant prédéfini, le distributeur doit vérifier qu’une combinaison réalisable existe.

Les boutons `10 000`, `20 000`, `50 000`, etc. doivent être masqués ou désactivés si la composition est impossible.

## 55. Montant libre

Le montant libre doit respecter :

- multiples de coupures disponibles ;
- minimum ;
- maximum ;
- limite client ;
- limite appareil ;
- disponibilité cash.

## 56. Expérience en panne partielle

Si un composant tombe en panne :

```text
printer down -> reçu numérique proposé
one cassette down -> montants recalculés
card reader down -> cardless éventuellement maintenu
network down -> retrait bloqué ou mode limité autorisé
cash dispenser down -> retraits désactivés
```

L’interface ne doit pas proposer un service indisponible.

## 57. Accessibilité opérationnelle

Le choix du matériel doit considérer :

- hauteur de l’écran ;
- accessibilité fauteuil roulant ;
- lisibilité en plein soleil ;
- contraste ;
- retour audio lorsque supporté ;
- touches physiques ou tactiles ;
- assistance distante.

## 58. Sites possibles

Mansa doit pouvoir déployer des distributeurs dans :

- agences ;
- centres commerciaux ;
- stations-service ;
- campus ;
- administrations ;
- gares ;
- aéroports ;
- commerces partenaires ;
- zones rurales sécurisées ;
- sites d’entreprise.

Chaque site possède ses propres heures, risques et règles de maintenance.

## 59. Déploiement progressif

Le premier distributeur peut fonctionner comme pilote.

Phases recommandées :

```text
PILOT_1_DEVICE
SMALL_NETWORK
CITY_EXPANSION
NATIONAL_NETWORK
MULTI_COUNTRY
```

Le logiciel doit être conçu dès le pilote pour supporter plusieurs appareils sans refonte du modèle de données.

## 60. Mode pilote

Le pilote doit permettre :

- monnaie réelle ou environnement contrôlé selon phase ;
- plafonds réduits ;
- utilisateurs autorisés ;
- surveillance renforcée ;
- logs complets ;
- rapprochement quotidien ;
- possibilité de désactivation immédiate.

## 61. Tests matériels obligatoires

Avant production :

- coupures XOF réelles ;
- cassette vide ;
- cassette presque vide ;
- billet coincé ;
- distribution partielle ;
- billets non pris ;
- coupure réseau avant autorisation ;
- coupure réseau après autorisation ;
- redémarrage en cours de retrait ;
- panne imprimante ;
- panne lecteur ;
- ouverture porte ;
- inversion cassette ;
- resynchronisation ;
- reversal ;
- double soumission ;
- coupure électrique.

## 62. Tests sécurité

Inclure :

- authentification ;
- RBAC ;
- isolation multi-tenant ;
- rejeu de token ;
- expiration token ;
- brute force ;
- manipulation montant ;
- fausse confirmation de distribution ;
- commande distante non autorisée ;
- firmware non signé ;
- exposition de secret ;
- journal immuable ;
- injection sur interfaces administratives.

## 63. Tests financiers

Inclure :

```text
success
failed dispense
partial dispense
reversal
late partner response
timeout
network retry
cash retract
duplicate callback
duplicate device event
reconciliation mismatch
```

## 64. Intégration ledger

Le retrait doit produire des écritures équilibrées selon le modèle comptable Mansa.

Le ledger ne doit pas être modifié directement par le contrôleur matériel.

Le matériel produit des événements ; le backend financier applique les écritures.

## 65. Intégration notifications

Notifications possibles :

- retrait réussi ;
- retrait refusé ;
- reversal ;
- retrait sans carte créé ;
- retrait sans carte expiré ;
- retrait inhabituel ;
- litige résolu.

## 66. Intégration risk engine

Le risk engine peut décider :

```text
ALLOW
ALLOW_WITH_STEP_UP
LIMIT_AMOUNT
DENY
REVIEW
```

Le distributeur doit respecter la décision serveur.

## 67. Intégration support

Le support doit pouvoir suivre un retrait sans modifier les preuves brutes.

Toute action financière de correction doit être séparée d’une simple note support.

## 68. Portail administrateur

Fonctions :

- carte des distributeurs ;
- statut temps réel ;
- cash par cassette ;
- retraits ;
- incidents ;
- maintenance ;
- rapprochement ;
- frais ;
- limites ;
- configuration ;
- historique d’audit.

## 69. Alertes cash prévisionnelles

À terme, Mansa peut prévoir :

- heure probable de rupture ;
- consommation par jour ;
- effet des jours de paie ;
- saisonnalité ;
- besoin de réapprovisionnement.

Une prévision ne doit jamais remplacer le comptage réel.

## 70. SLA et disponibilité

Les SLA doivent être configurables par opérateur.

Mesures :

```text
uptime
meanTimeToRepair
cashAvailability
transactionAvailability
networkAvailability
partnerAvailability
```

## 71. Anti-corruption interne

Les opérations cash doivent permettre de rapprocher :

```text
montant chargé
-> cassette identifiée
-> inventaire attendu
-> retraits confirmés
-> billets rétractés
-> montant collecté
-> montant compté
-> dépôt bancaire
```

Aucun ajustement ne doit effacer l’écart brut historique.

## 72. Comptage et dépôt bancaire

Après collecte :

```text
COLLECTED
-> COUNTED
-> RECONCILED
-> BANK_DEPOSIT_PREPARED
-> BANK_DEPOSIT_CONFIRMED
```

Les preuves de dépôt doivent être rattachables au lot de cash concerné.

## 73. Non-objectifs initiaux

La première version ne doit pas obligatoirement inclure :

- dépôt automatique cash ;
- recyclage billets ;
- change de devises physique ;
- encaissement de chèques ;
- biométrie directement sur distributeur ;
- crédit instantané au distributeur.

Ces fonctions peuvent être ajoutées ultérieurement.

## 74. Dépendances avec les autres domaines Mansa

Ce module dépend notamment de :

```text
identity
security
cards
wallets
ledger
pricing
risk
limits
notifications
devices
observability
support
disputes
reconciliation
privacy
cryptography
```

Il doit réutiliser ces capacités plutôt que créer des systèmes parallèles.

## 75. Critères d’acceptation minimum

Le domaine est acceptable lorsque :

1. un retrait réussi est autorisé, distribué, confirmé et comptabilisé une seule fois ;
2. un retrait sans distribution ne produit pas de perte client définitive ;
3. une distribution partielle est détectable et régularisable ;
4. les cassettes et le cash sont rapprochables ;
5. les frais sont affichables et configurables ;
6. les limites et le risk engine sont appliqués ;
7. les appareils sont multi-fournisseurs ;
8. les retraits sans carte utilisent des tokens courts et à usage unique ;
9. les opérations de maintenance sont auditées ;
10. les secrets de paiement ne sont jamais journalisés ;
11. les modes réseau dégradés sont sûrs et idempotents ;
12. les écarts cash restent visibles ;
13. les opérations peuvent être réconciliées avec le partenaire et le ledger ;
14. l’interface prend en charge FR, BM et EN ;
15. un appareil compromis peut être mis en quarantaine à distance.

## 76. Résultat attendu

Mansa dispose d’un domaine complet de retrait et d’accès aux espèces capable de piloter un premier distributeur puis un réseau multi-fournisseurs, de traiter les retraits par carte et sans carte, de gérer le cash physique, les cassettes, les reversals, les incidents et le rapprochement, tout en restant cohérent avec le ledger, le risk engine, la sécurité, les limites, les commissions et la gouvernance multi-tenant existants.
