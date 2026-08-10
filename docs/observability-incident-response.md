# Cahier des charges — Observabilité, supervision, incidents et continuité opérationnelle

## 1. Objet

Ce document définit le domaine transverse Mansa chargé de l’observabilité technique, de la supervision opérationnelle, de la détection d’incidents, de l’astreinte, de la gestion de crise, de la continuité de service et de l’amélioration post-incident.

Il s’applique à l’ensemble de l’écosystème Mansa : API, applications mobiles et web, paiements, wallets, ledger, cartes, Mobile Money, banques partenaires, TPE, commerçants, agents, secteur public, péages, transport, Jini Voice, notifications, KYC/KYB, fraude, trésorerie, rapprochement, reporting, intégrations partenaires et infrastructure.

L’objectif est de détecter rapidement les dégradations, comprendre leur cause, limiter leur impact, restaurer le service de manière sûre et conserver une trace exploitable sans exposer de secrets ni de données sensibles.

## 2. Principes directeurs

1. Toute fonctionnalité critique doit produire des signaux d’observabilité exploitables.
2. Les logs, métriques et traces ne doivent jamais contenir de PIN, CVV, clé privée, secret, token brut, mot de passe ou donnée bancaire complète.
3. Les identifiants personnels doivent être minimisés, pseudonymisés ou masqués selon le besoin opérationnel.
4. L’observabilité ne doit pas modifier la logique financière ni devenir une source de vérité comptable.
5. Le ledger, les transactions et les journaux d’audit métier restent distincts des logs techniques.
6. Les alertes doivent être actionnables et réduire le bruit.
7. Les incidents critiques doivent être corrélables par service, pays, tenant, partenaire, rail de paiement et environnement.
8. La supervision doit couvrir les dépendances externes et pas seulement les services Mansa.
9. Toute action manuelle d’administration pendant un incident doit rester auditée.
10. La reprise doit privilégier l’intégrité financière avant la disponibilité apparente.
11. Aucun mécanisme de retry ne doit provoquer de double débit.
12. Les opérations hors ligne doivent être supervisées jusqu’à leur resynchronisation complète.
13. Les procédures doivent fonctionner en mode multi-pays et multi-tenant.
14. Les seuils doivent être configurables par environnement et criticité.
15. Une panne d’un partenaire ne doit pas être confondue avec une panne interne.

## 3. Périmètre

Le domaine couvre notamment :

- logs applicatifs et infrastructure ;
- métriques techniques ;
- métriques métier de santé ;
- traces distribuées ;
- corrélation de requêtes ;
- health checks ;
- synthetic monitoring ;
- supervision des files et workers ;
- supervision bases de données ;
- supervision Redis/cache ;
- supervision des intégrations bancaires et Mobile Money ;
- supervision TPE et terminaux ;
- supervision péages et contrôleurs locaux ;
- supervision téléphonie Jini Voice ;
- détection d’anomalies opérationnelles ;
- alerting ;
- escalade ;
- gestion d’incident ;
- communication de crise ;
- post-mortem ;
- SLO/SLI ;
- capacité ;
- continuité de service ;
- reprise après sinistre ;
- tests de résilience ;
- tableaux de bord ;
- conservation et accès aux données d’observabilité.

## 4. Non-objectifs

Ce domaine ne remplace pas :

- le ledger ;
- les journaux d’audit réglementaires ;
- le moteur fraude ;
- le SIEM de sécurité ;
- le moteur de rapprochement ;
- les mécanismes de sauvegarde ;
- les procédures réglementaires de notification d’incident propres à chaque pays ;
- les contrats de SLA fournisseurs.

Il fournit les signaux et workflows nécessaires pour opérer ces domaines correctement.

## 5. Modèle d’observabilité

Mansa doit utiliser les trois piliers classiques :

```text
LOGS
METRICS
TRACES
```

Ils doivent partager des identifiants de corrélation cohérents.

Champs techniques recommandés :

```text
traceId
spanId
requestId
correlationId
serviceName
serviceVersion
environment
region
countryCode
tenantId
partnerId
operationName
status
errorCode
durationMs
timestamp
```

## 6. Corrélation de bout en bout

Une opération métier traversant plusieurs services doit pouvoir être suivie sans exposer ses secrets.

Exemple :

```text
application client
→ api gateway
→ service paiement
→ risk engine
→ ledger
→ adaptateur partenaire
→ webhook partenaire
→ notification
```

Tous les services doivent propager un identifiant de corrélation.

## 7. Identifiants financiers

Les logs peuvent contenir des identifiants techniques non secrets :

```text
paymentId
transactionId
walletId
ledgerEntryId
merchantId
terminalId
mandateId
payoutId
```

Les valeurs sensibles associées doivent être masquées ou exclues.

## 8. Données interdites dans les logs

Interdiction explicite de journaliser :

- PIN ;
- CVV/CVC ;
- PAN complet ;
- mot de passe ;
- OTP en clair ;
- token JWT complet ;
- refresh token ;
- secret API ;
- clé privée ;
- seed cryptographique ;
- clé de chiffrement ;
- contenu KYC brut non nécessaire ;
- enregistrement vocal complet par défaut ;
- document d’identité intégral dans un log ;
- coordonnées bancaires complètes lorsque non nécessaires.

## 9. Masquage

Exemples de représentation acceptable :

```text
card = **** **** **** 1234
phone = +223******42
email = z***@example.com
account = ****6789
```

Les règles de masquage doivent être centralisées et testées.

## 10. Logs structurés

Les logs de production doivent être structurés, idéalement JSON.

Niveaux :

```text
TRACE
DEBUG
INFO
WARN
ERROR
FATAL
```

`DEBUG` et `TRACE` doivent être contrôlés en production et ne jamais permettre une fuite de secret.

## 11. Taxonomie des erreurs

Chaque domaine doit utiliser des codes stables.

Exemples :

```text
PAYMENT_PROVIDER_TIMEOUT
PAYMENT_DUPLICATE_REQUEST
WALLET_INSUFFICIENT_FUNDS
LEDGER_INVARIANT_VIOLATION
CARD_PROVIDER_UNAVAILABLE
MOBILE_MONEY_TIMEOUT
TOLL_CONTROLLER_OFFLINE
DEVICE_HEARTBEAT_MISSED
DATABASE_CONNECTION_EXHAUSTED
QUEUE_BACKLOG_HIGH
```

Les messages utilisateurs restent séparés des messages techniques.

## 12. Métriques techniques minimales

Chaque service HTTP doit exposer au minimum :

- taux de requêtes ;
- latence p50/p95/p99 ;
- taux 2xx/4xx/5xx ;
- erreurs par code ;
- connexions actives ;
- timeouts ;
- saturation ;
- mémoire ;
- CPU ;
- redémarrages ;
- durée de démarrage.

## 13. Métriques base de données

Surveillance recommandée :

- connexions actives ;
- pool saturé ;
- requêtes lentes ;
- verrous ;
- deadlocks ;
- réplication ;
- taille ;
- taux d’erreur ;
- latence ;
- espace disque ;
- migrations échouées.

## 14. Métriques de files et workers

Pour chaque queue :

```text
queueDepth
oldestMessageAge
processingRate
successRate
failureRate
retryRate
deadLetterCount
workerCount
```

Une file qui grossit sans erreur visible doit déclencher une alerte avant saturation.

## 15. Métriques métier de santé

Ces métriques ne remplacent pas le reporting financier mais permettent de détecter une panne.

Exemples :

- taux de paiement réussi ;
- taux de refus ;
- taux de timeout partenaire ;
- temps de confirmation ;
- volume de transactions par rail ;
- nombre de transactions en état intermédiaire trop longtemps ;
- nombre de rapprochements non résolus ;
- nombre de webhooks en attente ;
- taux de notification échouée ;
- taux de connexion utilisateur ;
- taux de KYC bloqué ;
- terminaux actifs/inactifs.

## 16. Traces distribuées

Les appels inter-services et partenaires doivent créer des spans permettant de distinguer :

```text
INTERNAL
DATABASE
CACHE
QUEUE
HTTP_EXTERNAL
BANK_PROVIDER
MOBILE_MONEY_PROVIDER
CARD_PROCESSOR
SMS_PROVIDER
VOICE_PROVIDER
```

Les payloads sensibles ne doivent pas être capturés automatiquement.

## 17. Health checks

Chaque service doit exposer des checks séparés :

```text
/liveness
/readiness
```

`liveness` indique si le processus est vivant.

`readiness` indique s’il peut réellement accepter du trafic.

Une dépendance non critique ne doit pas nécessairement faire tomber la readiness globale.

## 18. Synthetic monitoring

Mansa doit pouvoir exécuter des scénarios synthétiques sans argent réel.

Exemples :

- connexion sandbox ;
- création de paiement test ;
- webhook test ;
- QR test ;
- consultation solde test ;
- lecture API partenaire sandbox ;
- ping contrôleur péage ;
- heartbeat terminal.

Les tests synthétiques doivent être explicitement identifiés et exclus des indicateurs financiers.

## 19. Supervision des partenaires externes

Pour chaque fournisseur :

```text
providerName
rail
country
availability
latency
errorRate
timeoutRate
lastSuccessAt
circuitState
```

Mansa doit pouvoir afficher clairement :

```text
MANSA_OK_PROVIDER_DOWN
MANSA_DEGRADED_PROVIDER_SLOW
MANSA_DOWN
```

## 20. Circuit breakers

Les adaptateurs externes peuvent utiliser :

```text
CLOSED
OPEN
HALF_OPEN
```

L’ouverture d’un circuit doit produire un événement d’observabilité.

Le fallback ne doit jamais simuler un paiement réussi.

## 21. Retries

Chaque retry doit être :

- limité ;
- observable ;
- idempotent ;
- différencié selon erreur temporaire ou permanente ;
- soumis à backoff.

Aucun retry aveugle sur un débit financier ambigu.

## 22. Transactions ambiguës

Lorsqu’un fournisseur timeout après réception potentielle d’un ordre :

```text
UNKNOWN
PENDING_PROVIDER_CONFIRMATION
REQUIRES_RECONCILIATION
```

Le système doit interroger le statut ou attendre le webhook avant de réémettre une opération pouvant doubler un débit.

## 23. SLI

Indicateurs de niveau de service possibles :

```text
availability
successfulRequestRate
paymentConfirmationLatency
providerCallbackLatency
queueProcessingLatency
```

Les SLI doivent être définis par parcours critique.

## 24. SLO

Les objectifs SLO sont configurables par service et environnement.

Ils ne doivent pas être codés en dur comme engagement contractuel universel.

Exemple de structure :

```text
sloId
service
indicator
objective
window
country
criticality
```

## 25. Error budget

Pour les services critiques, Mansa peut calculer un budget d’erreur afin d’arbitrer entre nouvelles fonctionnalités et fiabilité.

Le budget ne doit jamais autoriser une violation d’intégrité financière.

## 26. Niveaux d’incident

Classification recommandée :

```text
SEV0_SECURITY_OR_FINANCIAL_INTEGRITY
SEV1_CRITICAL
SEV2_MAJOR
SEV3_MINOR
SEV4_INFORMATIONAL
```

## 27. SEV0

Exemples :

- risque de double débit massif ;
- incohérence ledger critique ;
- compromission active ;
- fuite confirmée de secrets de production ;
- perte d’intégrité financière ;
- capacité non maîtrisée de contourner des autorisations critiques.

Actions immédiates possibles :

- stopper le flux concerné ;
- isoler le service ;
- désactiver un rail ;
- geler certaines opérations ;
- activer la cellule de crise.

## 28. SEV1

Exemples :

- paiements largement indisponibles ;
- connexion utilisateurs indisponible ;
- base principale inaccessible ;
- partenaire majeur indisponible sans fallback ;
- grand réseau de terminaux hors ligne.

## 29. SEV2

Exemples :

- fonction importante dégradée ;
- pays ou partenaire isolé touché ;
- délais élevés ;
- notifications retardées ;
- reporting temporairement indisponible.

## 30. Rôles incident

Rôles recommandés :

```text
IncidentCommander
TechnicalLead
OperationsLead
CommunicationsLead
SecurityLead
BusinessOwner
Scribe
```

Une même personne peut cumuler certains rôles selon la taille de l’équipe, sauf séparation exigée.

## 31. IncidentCommander

Responsabilités :

- coordonner ;
- fixer les priorités ;
- éviter les changements concurrents ;
- décider des escalades ;
- suivre le rétablissement ;
- clôturer l’incident opérationnel.

## 32. Timeline

Chaque incident doit conserver :

```text
incidentId
detectedAt
declaredAt
acknowledgedAt
mitigationStartedAt
serviceRestoredAt
resolvedAt
```

## 33. Journal d’incident

Événements recommandés :

```text
ALERT_TRIGGERED
INCIDENT_DECLARED
OWNER_ASSIGNED
MITIGATION_STARTED
CHANGE_APPLIED
PROVIDER_CONTACTED
SERVICE_RECOVERED
INCIDENT_RESOLVED
POSTMORTEM_OPENED
```

## 34. Communication interne

Le canal de crise doit être dédié et conserver les décisions importantes.

Les informations sensibles ne doivent pas être copiées sans nécessité dans des canaux non sécurisés.

## 35. Communication utilisateur

Pour une panne visible :

- message simple ;
- services concernés ;
- alternatives disponibles ;
- éviter de promettre une heure de résolution non confirmée ;
- mise à jour lorsque l’état change.

## 36. Status page

Une page de statut peut présenter :

```text
Operational
Degraded Performance
Partial Outage
Major Outage
Maintenance
```

Les composants peuvent être regroupés par pays ou service.

## 37. Maintenance planifiée

Toute maintenance sensible doit préciser :

- fenêtre ;
- composants ;
- impact ;
- rollback ;
- responsables ;
- communication ;
- vérifications avant/après.

## 38. Feature flags et kill switches

Les fonctionnalités critiques doivent pouvoir être désactivées de manière contrôlée lorsque pertinent.

Exemples :

```text
disableNewCardPayments
disableSpecificProvider
disableCashTollLane
disableMobileMoneyAtCountryLevel
```

Toute modification doit être auditée.

Concernant les péages, Mobile Money doit rester un canal configurable et ne doit jamais être supprimé automatiquement du produit.

## 39. Péages — exigences de référence

Le monitoring péage doit respecter simultanément les architectures suivantes :

- solution A : péage automatique classique avec barrière ;
- solution B : télépéage UHF RFID avec barrière ;
- évolution future optionnelle : free-flow sans barrière, sans remplacer A ni B.

## 40. Péage classique

La supervision doit distinguer les canaux configurés :

- billets FCFA/XOF ;
- pièces FCFA/XOF ;
- carte bancaire EMV ;
- réseaux activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

Aucun dashboard ne doit laisser croire que toutes les cartes du monde sont garanties.

## 41. Mobile Money péage

La supervision doit afficher l’état d’activation selon :

```text
NATIONAL
NETWORK
TOLL_PLAZA
LANE
```

Une désactivation administrative volontaire doit être distinguée d’une panne technique.

Chaque changement conserve date d’effet et audit.

## 42. Télépéage RFID

Signaux recommandés :

```text
readerOnline
antennaOnline
controllerOnline
barrierOnline
passageSensorOnline
rfidReadsPerMinute
rfidReadFailureRate
openRelayCommands
barrierOpenConfirmations
vehiclePassageConfirmations
```

## 43. Rapprochement anti-corruption péage

La supervision doit permettre de détecter les divergences entre :

```text
véhicule détecté
→ catégorie
→ tarif attendu
→ paiement
→ commande OPEN
→ ouverture réelle
→ passage physique
```

Toute ouverture manuelle doit produire un événement auditable distinct.

## 44. Mode hors ligne péage

Pour chaque contrôleur local :

```text
offlineSince
localQueueDepth
oldestUnsyncedEventAge
lastSuccessfulSyncAt
syncConflictCount
```

Le retour en ligne doit confirmer :

- absence de double débit ;
- ordre des événements ;
- resynchronisation ;
- rapprochement.

## 45. Trois niveaux d’équipement péage

La supervision doit supporter :

```text
FULL_AUTOMATED_LANE
SEMI_AUTOMATED_LANE
LOW_COST_DIGITIZED_POST
```

Le niveau d’équipement influence les signaux disponibles mais pas les exigences minimales d’audit.

## 46. Matériel multi-fournisseurs

Les métriques matérielles doivent passer par des adaptateurs.

Interfaces possibles :

```text
REST
SDK
TCP/IP
RS-232
RS-485
GPIO
relais/contact sec
interface industrielle documentée
```

Le modèle d’observabilité ne doit dépendre d’aucun fabricant unique.

## 47. Marque blanche

Les tableaux publics, écrans de borne et communications peuvent utiliser la marque :

- État ;
- concessionnaire ;
- entreprise ;
- exploitant.

La mention `Propulsé par Mansa` reste facultative selon configuration.

## 48. Terminaux et TPE

Métriques recommandées :

```text
terminalOnline
lastHeartbeatAt
batteryLevel
networkType
appVersion
firmwareVersion
paymentReaderStatus
printerStatus
secureModuleStatus
```

Aucun secret cryptographique du terminal ne doit remonter dans la télémétrie.

## 49. Jini Voice

Métriques :

- appels entrants ;
- décroché IA ;
- transfert humain ;
- latence STT ;
- latence TTS ;
- détection langue ;
- taux d’échec fournisseur téléphonique ;
- durée ;
- erreurs WebSocket ;
- consommation IA.

Les transcriptions complètes ne doivent pas être envoyées dans les logs techniques par défaut.

## 50. Notifications

Surveiller :

```text
queued
sent
delivered
failed
providerRejected
retrying
```

Distinguer SMS, push, email, WhatsApp ou autres canaux activés.

## 51. KYC/KYB

Surveiller :

- dossiers en attente ;
- temps de traitement ;
- échecs fournisseur ;
- documents impossibles à traiter ;
- callbacks manquants.

Ne jamais exporter les documents eux-mêmes dans les logs.

## 52. Sécurité et SIEM

Les événements de sécurité pertinents peuvent être routés vers un SIEM :

- connexions admin ;
- élévations de privilège ;
- changements de configuration critique ;
- tentatives répétées ;
- secrets détectés ;
- accès interdits.

L’observabilité applicative et le SIEM doivent pouvoir être corrélés.

## 53. Dashboards

Dashboards recommandés :

```text
Executive Service Health
Payments
Ledger
Wallets
Cards
Mobile Money
Bank Partners
Merchants
Agents
Terminals
Public Sector
Tolls
Transport
Jini Voice
Databases
Queues
Infrastructure
Security Signals
```

## 54. Vue exécutive

La vue exécutive doit rester simple :

- services opérationnels ;
- incidents ouverts ;
- pays affectés ;
- principaux partenaires affectés ;
- tendance taux de succès ;
- pas de données client sensibles.

## 55. Alertes

Une alerte doit contenir :

```text
alertName
severity
service
country
partner
observedValue
threshold
startedAt
runbookUrl
```

## 56. Anti-bruit

Mécanismes recommandés :

- fenêtre temporelle ;
- déduplication ;
- regroupement ;
- cooldown ;
- seuil relatif ;
- seuil dynamique ;
- maintenance silencieuse contrôlée.

Une alerte volontairement silencée doit rester visible et auditée.

## 57. Escalade

Exemple :

```text
primaryOnCall
→ secondaryOnCall
→ engineeringLead
→ incidentCommander
→ executiveStakeholder
```

Les délais dépendent de la criticité.

## 58. Runbooks

Chaque alerte critique doit avoir un runbook contenant :

- description ;
- impact ;
- vérifications ;
- commandes sûres ;
- rollback ;
- escalade ;
- dépendances ;
- erreurs fréquentes.

Les runbooks ne doivent contenir aucun secret en clair.

## 59. Sauvegardes

L’observabilité doit vérifier :

```text
lastBackupAt
backupDuration
backupStatus
restoreTestStatus
```

Un backup « réussi » n’est pas suffisant si aucun test de restauration n’est réalisé périodiquement.

## 60. Reprise après sinistre

Chaque composant critique définit :

```text
RTO
RPO
backupStrategy
restoreProcedure
failoverStrategy
```

Les valeurs dépendent du service et ne doivent pas être inventées uniformément.

## 61. Tests de restauration

Les restaurations doivent être testées sur environnement isolé lorsque possible.

Résultats conservés :

- date ;
- dataset ;
- durée ;
- succès ;
- anomalies ;
- actions correctives.

## 62. Chaos et résilience

Tests possibles en environnement contrôlé :

- coupure réseau ;
- latence partenaire ;
- timeout DB ;
- worker arrêté ;
- Redis indisponible ;
- perte d’un nœud ;
- webhook retardé ;
- contrôleur péage hors ligne.

Aucun test destructif ne doit viser la production sans procédure approuvée.

## 63. Déploiements

Chaque déploiement doit être corrélable aux métriques.

Champs :

```text
deploymentId
service
version
commitSha
startedAt
completedAt
result
```

Une hausse d’erreurs après déploiement doit être identifiable rapidement.

## 64. Canary et progressive delivery

Pour les services critiques, possibilité de :

```text
CANARY
BLUE_GREEN
ROLLING
FEATURE_FLAG
```

Le rollback doit être rapide et documenté.

## 65. Migration de base

Les migrations doivent produire des événements :

```text
MIGRATION_STARTED
MIGRATION_COMPLETED
MIGRATION_FAILED
```

Une migration irréversible nécessite une procédure explicite.

## 66. Capacité

Surveiller :

- croissance requêtes ;
- DB ;
- stockage ;
- files ;
- CPU ;
- mémoire ;
- connexions ;
- bande passante ;
- quotas fournisseurs.

## 67. Quotas externes

Exemples :

- SMS ;
- API bancaire ;
- IA ;
- téléphonie ;
- stockage ;
- KYC ;
- notifications push.

Alerter avant épuisement.

## 68. Multi-tenant

Les dashboards internes peuvent filtrer par tenant.

Un tenant ne doit jamais accéder aux métriques ou logs détaillés d’un autre tenant.

## 69. Portail entreprise/État

Les clients autorisés peuvent voir uniquement des indicateurs adaptés :

- disponibilité de leurs services ;
- terminaux ;
- incidents les concernant ;
- volumes agrégés autorisés.

Aucun détail d’infrastructure interne sensible.

## 70. Conservation

La rétention des logs, métriques et traces doit être configurable par :

```text
dataType
environment
country
classification
```

Les durées doivent être alignées sur contraintes légales, sécurité, coût et besoin opérationnel.

## 71. Suppression

La suppression de données d’observabilité doit respecter :

- politiques de rétention ;
- obligations de conservation ;
- litiges ;
- sécurité ;
- anonymisation lorsque adaptée.

## 72. Contrôle d’accès

Rôles possibles :

```text
SRE
ENGINEER
SECURITY
SUPPORT
AUDITOR
INCIDENT_COMMANDER
BUSINESS_READ_ONLY
```

Le principe du moindre privilège s’applique.

## 73. Accès aux logs de production

L’accès doit être :

- authentifié ;
- journalisé ;
- limité ;
- révocable ;
- séparé des environnements de développement.

## 74. Environnements

Séparation explicite :

```text
LOCAL
DEVELOPMENT
TEST
SANDBOX
STAGING
PRODUCTION
```

Les logs de test ne doivent pas être mélangés aux incidents production.

## 75. Données de test

Les environnements non production doivent privilégier des données synthétiques.

Les données production ne doivent pas être copiées librement dans des environnements moins sécurisés.

## 76. Post-mortem

Tout incident majeur doit produire un post-mortem sans recherche de culpabilité individuelle.

Sections :

```text
Résumé
Impact
Détection
Timeline
Cause racine
Facteurs contributifs
Ce qui a bien fonctionné
Ce qui a échoué
Actions correctives
Responsables
Échéances
```

## 77. Actions correctives

Chaque action doit être suivie jusqu’à clôture.

Types :

```text
PREVENT
DETECT
MITIGATE
DOCUMENT
AUTOMATE
TEST
```

## 78. Métriques d’incident

Indicateurs internes :

```text
MTTD
MTTA
MTTM
MTTR
incidentCountBySeverity
repeatIncidentRate
```

Ils doivent servir à améliorer le système, pas à évaluer individuellement les personnes.

## 79. API interne d’incidents

Entités recommandées :

```text
Incident
IncidentEvent
IncidentServiceImpact
IncidentTenantImpact
IncidentPartnerImpact
IncidentAction
IncidentCommunication
IncidentPostmortem
AlertRule
AlertInstance
Runbook
ServiceLevelObjective
```

## 80. Audit

Actions auditables :

- modification d’alerte ;
- désactivation d’alerte ;
- changement seuil ;
- kill switch ;
- activation/désactivation rail ;
- modification configuration péage ;
- accès exceptionnel production ;
- clôture incident ;
- suppression de données d’observabilité.

## 81. Notifications d’incident

Canaux possibles :

```text
PUSH
SMS
EMAIL
VOICE
INTERNAL_CHAT
PAGER
```

La redondance est recommandée pour les alertes critiques.

## 82. Dégradation gracieuse

Lorsqu’un composant non essentiel tombe :

- masquer la fonction indisponible ;
- conserver les fonctions sûres ;
- afficher une information claire ;
- ne pas inventer de succès ;
- ne pas affaiblir la sécurité.

## 83. Mode lecture seule

Certains incidents peuvent déclencher un mode lecture seule pour protéger l’intégrité.

Exemples :

- incohérence base ;
- risque ledger ;
- maintenance critique.

## 84. Protection des flux financiers

En cas d’incertitude :

```text
INTÉGRITÉ > DISPONIBILITÉ
```

Il vaut mieux bloquer temporairement une opération que produire un débit incohérent ou non rapprochable.

## 85. Rapprochement après incident

Après incident de paiement :

1. identifier opérations ambiguës ;
2. interroger partenaires ;
3. rapprocher ledger ;
4. détecter doublons ;
5. corriger via workflows autorisés ;
6. notifier si nécessaire ;
7. conserver audit.

## 86. Support client

Le support doit pouvoir voir un statut simplifié :

```text
KNOWN_INCIDENT
SERVICE_DEGRADED
PARTNER_OUTAGE
RECOVERED
```

Il ne doit pas avoir accès aux secrets ni détails d’infrastructure inutiles.

## 87. Intégration GitHub/CI

Les pipelines doivent produire :

- build status ;
- test status ;
- sécurité ;
- migration ;
- déploiement ;
- version.

Les commits et déploiements doivent être corrélables.

## 88. Infrastructure as Code

Les changements d’infrastructure doivent être versionnés et audités.

Les modifications manuelles urgentes doivent être réconciliées ensuite dans la configuration déclarative.

## 89. Secret management

Les secrets proviennent d’un gestionnaire dédié ou mécanisme sécurisé de plateforme.

Ils ne doivent jamais être inclus dans :

- logs ;
- dashboards ;
- traces ;
- tickets ;
- captures d’écran ;
- dépôts Git.

## 90. Horodatage

Les événements techniques doivent être horodatés en UTC avec précision suffisante.

L’affichage utilisateur peut être localisé.

## 91. Synchronisation horaire

Serveurs, terminaux et contrôleurs doivent utiliser une synchronisation d’horloge fiable lorsqu’elle est disponible.

Les événements hors ligne doivent conserver heure locale source et métadonnées nécessaires à la réconciliation.

## 92. Qualité des données d’observabilité

Le système doit détecter :

- métriques absentes ;
- heartbeat absent ;
- volume de logs anormal ;
- exporter bloqué ;
- dérive d’horloge ;
- cardinalité excessive.

## 93. Cardinalité

Éviter d’utiliser comme labels de métriques :

- transactionId ;
- userId ;
- requestId ;
- valeurs libres non bornées.

Ces informations appartiennent plutôt aux logs/traces.

## 94. Coûts

L’observabilité doit elle-même être suivie :

```text
logIngestionVolume
traceSamplingRate
metricSeriesCount
retentionCost
```

Le contrôle des coûts ne doit pas supprimer les signaux critiques nécessaires à la sécurité et l’intégrité.

## 95. Sampling traces

Le sampling peut être dynamique :

- faible pour succès répétitifs ;
- élevé pour erreurs ;
- 100 % pour certains parcours critiques pendant investigation.

Les changements temporaires doivent expirer automatiquement si possible.

## 96. Critères d’acceptation minimaux

Le domaine est considéré correctement initialisé lorsque :

1. tous les services critiques ont logs structurés ;
2. aucun secret connu n’apparaît dans les logs ;
3. métriques HTTP et dépendances existent ;
4. traces permettent de suivre un paiement de bout en bout ;
5. alertes critiques disposent de runbooks ;
6. les partenaires externes sont supervisés séparément ;
7. les opérations ambiguës sont détectables ;
8. les queues ont des seuils ;
9. les sauvegardes sont supervisées ;
10. un incident peut être déclaré et suivi ;
11. les actions d’administration critique sont auditables ;
12. les dashboards respectent l’isolation multi-tenant ;
13. le mode hors ligne péage est observable ;
14. les ouvertures manuelles de barrière sont auditables ;
15. les tests de reprise sont documentés.

## 97. Tests obligatoires

Prévoir au minimum :

- test masquage secrets ;
- test propagation correlationId ;
- test trace inter-services ;
- test alerte taux d’erreur ;
- test queue backlog ;
- test timeout partenaire ;
- test circuit breaker ;
- test transaction ambiguë sans retry destructif ;
- test kill switch audité ;
- test isolation tenant dashboards ;
- test contrôleur péage offline/resync ;
- test restauration sauvegarde ;
- test dégradation partielle ;
- test runbook incident critique.

## 98. Déploiement progressif

Ordre recommandé :

```text
Phase 1 — logs structurés + métriques + health checks
Phase 2 — tracing distribué + dashboards
Phase 3 — alerting + runbooks + astreinte
Phase 4 — SLO + error budgets
Phase 5 — résilience + chaos contrôlé + DR automatisé
```

## 99. Résultat attendu

Mansa doit pouvoir répondre rapidement et factuellement aux questions suivantes :

- quel service est en panne ?
- depuis quand ?
- quel pays est affecté ?
- quels tenants sont affectés ?
- quel partenaire est en cause ?
- quelles opérations sont ambiguës ?
- y a-t-il un risque de double débit ?
- quelles files sont bloquées ?
- quels terminaux ou péages sont hors ligne ?
- le service est-il sûr à réactiver ?
- le rapprochement post-incident est-il terminé ?

Le système d’observabilité doit permettre de restaurer le service sans sacrifier l’intégrité, la sécurité, l’auditabilité ni la séparation multi-tenant.