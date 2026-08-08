# 91 — Observabilité, SRE, résilience, incidents et continuité de service Mansa

## 1. Objet

Ce document définit le cahier des charges transversal de fiabilité opérationnelle de Mansa. Il couvre l’observabilité, les objectifs de niveau de service, la supervision, la détection d’incidents, l’astreinte, les runbooks, la résilience, la reprise après sinistre, les sauvegardes, les tests de continuité, le reporting de disponibilité et la communication opérationnelle.

Ce module s’applique à l’ensemble de l’écosystème Mansa : applications Client, Commerçant, Agent, TPE, Admin Lite, portails Web, API Gateway, services métier, bases de données, files de messages, cache, stockage, intégrations partenaires, Mobile Money, paiements cartes, modules État, péages, Jini Voice et services futurs.

La fiabilité doit être conçue dès le développement. Elle ne doit pas être ajoutée uniquement après le premier incident de production.

## 2. Principes directeurs

Mansa doit appliquer au minimum les principes suivants :

- aucune panne critique ne doit rester invisible ;
- chaque requête importante doit être corrélable de bout en bout ;
- les journaux ne doivent jamais contenir de secret, PIN, mot de passe, clé privée ou donnée bancaire interdite ;
- les métriques doivent permettre de distinguer indisponibilité technique, refus métier, refus partenaire et erreur utilisateur ;
- un incident ne doit pas être masqué par une simple relance automatique ;
- toute relance automatique doit être bornée, observable et éviter les doubles traitements ;
- les opérations financières doivent être idempotentes ;
- les modes dégradés doivent être explicites, contrôlés et auditables ;
- la reprise après incident doit préserver l’intégrité du ledger et éviter tout double débit ;
- les dépendances externes doivent être isolées par timeouts, retries contrôlés, circuit breakers et files de reprise lorsque pertinent ;
- les plans de continuité doivent être testés périodiquement.

## 3. Périmètre d’observabilité

Le système doit couvrir trois piliers techniques :

```text
Logs
Metrics
Traces
```

Ils doivent être enrichis par :

- événements métier ;
- événements de sécurité ;
- événements financiers ;
- événements matériels ;
- événements partenaires ;
- changements de configuration ;
- incidents ;
- déploiements ;
- migrations ;
- bascules de mode dégradé.

## 4. Identifiants de corrélation

Chaque transaction ou requête distribuée doit pouvoir être suivie avec des identifiants dédiés :

- `requestId` ;
- `correlationId` ;
- `traceId` ;
- `spanId` ;
- `transactionId` métier ;
- `idempotencyKey` lorsque applicable ;
- identifiant de message asynchrone ;
- identifiant de partenaire ;
- identifiant de tenant/organisation lorsque autorisé.

Ces identifiants ne doivent pas contenir de donnée personnelle en clair.

## 5. Journalisation structurée

Les logs doivent être structurés, idéalement JSON, avec un schéma stable.

Champs recommandés :

```text
timestamp
level
service
environment
version
requestId
traceId
correlationId
tenantId
action
resource
status
latencyMs
errorCode
partner
region
instance
```

Les niveaux recommandés sont :

```text
TRACE
DEBUG
INFO
WARN
ERROR
FATAL
```

`DEBUG` et `TRACE` doivent être contrôlés en production afin de ne pas exposer de données sensibles ni générer des coûts excessifs.

## 6. Données interdites dans les logs

Il est interdit de journaliser en clair :

- mot de passe ;
- PIN ;
- OTP complet ;
- token d’accès ;
- refresh token ;
- clé API ;
- secret HMAC ;
- clé privée ;
- données CVV ;
- PAN carte complet lorsque non autorisé ;
- documents KYC complets ;
- contenu biométrique ;
- secrets opérateur ;
- chaînes de connexion contenant des identifiants sensibles.

Une politique de masquage et de redaction doit être appliquée avant ingestion des logs.

## 7. Métriques techniques

Chaque service doit publier au minimum :

- disponibilité ;
- requêtes par seconde ;
- taux d’erreur ;
- latence p50, p95 et p99 ;
- saturation CPU ;
- mémoire ;
- espace disque ;
- connexions base de données ;
- pool de connexions ;
- longueur des files ;
- âge du message le plus ancien ;
- cache hit ratio ;
- taux de timeout ;
- taux de retry ;
- circuit breakers ouverts ;
- redémarrages ;
- santé des pods/instances/conteneurs ;
- erreurs de dépendance externe.

## 8. Métriques métier

Les métriques techniques doivent être complétées par des indicateurs métier.

Exemples :

- paiements initiés ;
- paiements réussis ;
- paiements refusés par raison ;
- transferts créés ;
- transferts finalisés ;
- remboursements ;
- dépôts et retraits agents ;
- opérations Mobile Money ;
- authentifications réussies/échouées ;
- KYC soumis/validés/rejetés ;
- transactions en attente anormalement longue ;
- webhooks en échec ;
- rapprochements non résolus ;
- ouvertures manuelles de barrière ;
- passages péage sans transaction associée ;
- anomalies de caisse ;
- appels Jini en erreur.

Les métriques métier ne doivent pas permettre à un utilisateur non autorisé d’inférer des données confidentielles d’un tenant.

## 9. Distributed tracing

Les services doivent propager les traces sur les appels internes et externes lorsque techniquement possible.

Les traces doivent permettre d’identifier :

- service source ;
- service destination ;
- latence ;
- statut ;
- retry ;
- dépendance partenaire ;
- requête base ;
- message asynchrone ;
- étape métier.

La collecte peut suivre les standards OpenTelemetry afin d’éviter une dépendance forte à un fournisseur unique.

## 10. Health checks

Chaque composant doit exposer des contrôles adaptés :

```text
liveness
readiness
startup
```

Un service ne doit pas être déclaré prêt uniquement parce que son processus tourne. La readiness doit refléter sa capacité réelle à traiter les opérations essentielles.

Les dépendances non critiques ne doivent pas nécessairement rendre tout le service indisponible si un mode dégradé sûr existe.

## 11. SLI, SLO et SLA

Mansa doit définir des Service Level Indicators et Service Level Objectives par produit.

Exemples de SLI :

- taux de requêtes réussies ;
- disponibilité de l’API ;
- latence p95 ;
- temps de traitement d’un paiement ;
- délai de livraison d’un webhook ;
- délai de synchronisation hors ligne ;
- délai de traitement d’un message ;
- disponibilité d’une voie de péage.

Un SLA contractuel ne doit être promis qu’après validation de l’architecture, des dépendances partenaires et des capacités d’exploitation.

## 12. Error budgets

Pour les services critiques, un budget d’erreur doit être défini.

Lorsque le budget est consommé trop rapidement :

- les changements risqués peuvent être ralentis ;
- les travaux de fiabilité deviennent prioritaires ;
- les déploiements non essentiels peuvent être suspendus ;
- une analyse de tendance doit être réalisée.

## 13. Classification des services

Les composants peuvent être classés par criticité :

```text
TIER_0_CRITICAL
TIER_1_HIGH
TIER_2_STANDARD
TIER_3_NON_CRITICAL
```

Exemples de Tier 0 :

- ledger ;
- orchestration de paiement ;
- authentification ;
- contrôle d’accès privilégié ;
- règlement/rapprochement critique ;
- émission d’autorisation financière.

Chaque tier définit : objectifs de disponibilité, astreinte, RTO, RPO, stratégie de sauvegarde et fréquence des tests.

## 14. Alerting

Les alertes doivent être basées sur l’impact et non sur le bruit.

Une alerte exploitable doit contenir :

- service ;
- environnement ;
- sévérité ;
- symptôme ;
- impact estimé ;
- heure de début ;
- dashboard ;
- trace ou requête exemple ;
- runbook ;
- propriétaire ;
- identifiant d’incident éventuel.

Les alertes sans action possible doivent être transformées en métrique ou rapport plutôt qu’en notification urgente.

## 15. Sévérité des incidents

Classification minimale :

```text
SEV0 — crise majeure / risque systémique
SEV1 — indisponibilité critique ou risque financier important
SEV2 — dégradation significative avec contournement limité
SEV3 — incident localisé à impact faible
SEV4 — défaut mineur / investigation non urgente
```

La sévérité dépend de l’impact réel : nombre d’utilisateurs, montants affectés, sécurité, données, administrations, partenaires, zones géographiques et durée.

## 16. Détection d’incident

Un incident peut être détecté par :

- alerte automatique ;
- anomalie métier ;
- signal fraude ;
- support ;
- partenaire ;
- utilisateur ;
- monitoring matériel ;
- audit ;
- équipe interne.

Tout incident significatif doit recevoir un identifiant unique.

## 17. Workflow incident

Cycle recommandé :

```text
DETECTED
→ ACKNOWLEDGED
→ TRIAGED
→ MITIGATING
→ MONITORING
→ RESOLVED
→ POSTMORTEM
→ CLOSED
```

Chaque changement d’état doit être horodaté et attribué.

## 18. Incident commander

Pour les incidents SEV0/SEV1, un Incident Commander doit être désigné.

Il coordonne :

- diagnostic ;
- priorités ;
- affectation des équipes ;
- décisions de mitigation ;
- communication ;
- escalade ;
- chronologie ;
- clôture.

La personne qui exécute une correction technique ne doit pas nécessairement être la même que celle qui coordonne l’incident.

## 19. Runbooks

Chaque alerte critique doit pointer vers un runbook.

Un runbook contient :

- symptôme ;
- impact ;
- vérifications ;
- dashboards ;
- commandes sûres ;
- critères de rollback ;
- critères de bascule ;
- dépendances ;
- contacts ;
- procédure de validation ;
- procédure de retour à la normale.

Les secrets ne doivent jamais être écrits dans les runbooks Git.

## 20. Déploiements et incidents

Chaque déploiement doit être corrélable aux métriques et incidents.

Le système doit conserver :

- version ;
- commit ;
- date ;
- environnement ;
- auteur ou pipeline ;
- migrations ;
- feature flags ;
- résultat ;
- rollback éventuel.

Lors d’une dégradation apparue immédiatement après déploiement, la possibilité de rollback doit être évaluée rapidement.

## 21. Feature flags

Les fonctionnalités à risque peuvent être protégées par feature flags.

Les flags doivent :

- être versionnés ou audités ;
- avoir un propriétaire ;
- préciser les environnements ;
- permettre un pourcentage de rollout ;
- permettre un ciblage contrôlé ;
- supporter un kill switch ;
- être supprimés lorsqu’ils ne servent plus.

Un feature flag ne doit pas devenir un mécanisme permanent permettant de contourner les contrôles de sécurité.

## 22. Résilience aux partenaires

Toute intégration externe doit définir :

- timeout ;
- retry ;
- backoff ;
- jitter ;
- circuit breaker ;
- idempotence ;
- file de reprise ;
- dead-letter queue si pertinent ;
- statut inconnu ;
- rapprochement ultérieur ;
- seuil d’alerte.

Le système doit distinguer :

```text
SUCCESS
FAILED
PENDING
UNKNOWN
REQUIRES_RECONCILIATION
```

Une absence de réponse partenaire ne doit jamais être interprétée automatiquement comme un échec définitif si une transaction financière peut avoir été exécutée côté partenaire.

## 23. Retries

Les retries automatiques doivent être interdits ou fortement contrôlés sur les opérations non idempotentes.

Pour les opérations financières :

- clé d’idempotence ;
- identifiant externe stable ;
- nombre de tentatives limité ;
- backoff ;
- statut intermédiaire ;
- rapprochement avant relance lorsque nécessaire.

## 24. Modes dégradés

Chaque domaine critique doit documenter ses modes dégradés.

Exemples :

- consultation seule ;
- paiement électronique disponible mais espèces indisponibles ;
- RFID disponible mais ANPR indisponible selon politique ;
- fonctionnement local du péage ;
- mise en file des notifications ;
- suspension temporaire d’une intégration partenaire ;
- désactivation d’un canal particulier ;
- service totalement fermé si l’intégrité ou la sécurité ne peut être garantie.

Le mode dégradé doit être visible dans l’administration et audité.

## 25. Référence péages et État

Pour les péages, les exigences de référence restent obligatoires :

- solution A : péage automatique classique avec barrière ;
- solution B : télépéage RFID UHF avec barrière ;
- free-flow futur optionnel sans remplacer les deux solutions initiales ;
- paiements classiques configurables : billets et pièces FCFA, carte EMV multi-réseaux selon acquéreur, NFC, carte Mansa, wallet Mansa, QR et Mobile Money ;
- Mobile Money activable/désactivable par administration aux niveaux national, réseau, poste ou voie avec date d’effet et audit ;
- télépéage initial par tag UHF RFID passif associé au véhicule et au compte, lecteur/antenne, contrôleur local, relais OPEN, barrière et capteurs ;
- fonctionnement local/hors ligne sécurisé, resynchronisation et absence de double débit ;
- matériel multi-fournisseurs derrière adaptateurs ;
- trois niveaux d’équipement : automatique complet, semi-automatique et poste numérisé à faible coût ;
- déploiement progressif ;
- matériel acheté par l’État/concessionnaire ou fourni/intégré/revendu par Mansa ;
- marque blanche configurable ;
- rapprochement anti-corruption véhicule → catégorie → tarif → paiement → ouverture → passage physique ;
- toute ouverture manuelle auditée.

L’observabilité doit fournir des métriques et alertes spécifiques sur ces flux.

## 26. Continuité de service

Un Business Continuity Plan doit couvrir au minimum :

- perte d’un fournisseur cloud ;
- panne régionale ;
- indisponibilité base de données ;
- corruption logique ;
- attaque cyber ;
- compromission d’un secret ;
- indisponibilité Mobile Money ;
- panne acquéreur carte ;
- panne réseau opérateur ;
- perte d’un site de péage ;
- indisponibilité d’un fournisseur SMS/voix ;
- erreur de déploiement ;
- migration défectueuse.

## 27. RTO et RPO

Chaque service critique doit définir :

- `RTO` : durée cible maximale de restauration ;
- `RPO` : perte de données maximale acceptable.

Le ledger et les écritures financières critiques doivent viser un RPO extrêmement faible, potentiellement nul selon l’architecture validée.

Les valeurs finales doivent être décidées par produit et environnement, pas codées en dur dans une règle globale unique.

## 28. Sauvegardes

Les sauvegardes doivent couvrir :

- bases relationnelles ;
- configurations ;
- stockage objet critique ;
- métadonnées ;
- clés publiques/certificats selon politique ;
- référentiels indispensables ;
- états nécessaires à la reconstruction.

Les sauvegardes doivent être :

- chiffrées ;
- isolées ;
- contrôlées ;
- soumises à rétention ;
- testées par restauration ;
- surveillées ;
- protégées contre suppression accidentelle ou malveillante selon criticité.

## 29. Test de restauration

Une sauvegarde non testée ne doit pas être considérée comme une garantie de reprise.

Des restaurations périodiques doivent vérifier :

- intégrité ;
- temps de restauration ;
- cohérence des données ;
- permissions ;
- dépendances ;
- capacité à redémarrer le service ;
- rapprochement après reprise.

## 30. Disaster Recovery

Le plan DR doit documenter :

```text
incident
→ gel des écritures si nécessaire
→ décision de bascule
→ restauration/bascule
→ validation données
→ validation sécurité
→ reprise contrôlée
→ rapprochement
→ communication
```

Pour les services financiers, la reprise ne doit pas être déclarée terminée tant que les transactions au statut incertain n’ont pas été identifiées et mises en rapprochement.

## 31. Tests de résilience

Des tests contrôlés doivent couvrir :

- perte d’instance ;
- perte de base secondaire ;
- latence partenaire ;
- timeout ;
- file saturée ;
- disque presque plein ;
- cache indisponible ;
- coupure réseau ;
- dépendance Mobile Money indisponible ;
- webhook consommateur indisponible ;
- reprise après coupure d’un contrôleur local de péage.

Les tests dangereux ne doivent pas être exécutés sur la production sans procédure spécifique.

## 32. Capacity planning

Le système doit suivre :

- croissance utilisateurs ;
- transactions/jour ;
- pointe TPS ;
- taille des bases ;
- files ;
- stockage ;
- bande passante ;
- coûts observabilité ;
- consommation API partenaire ;
- ressources par tenant ;
- projections de croissance.

Des seuils de capacité doivent déclencher des actions avant saturation.

## 33. Protection contre surcharge

Les services doivent pouvoir utiliser :

- rate limiting ;
- quotas ;
- backpressure ;
- load shedding ;
- priorisation ;
- circuit breakers ;
- files ;
- cache ;
- autoscaling ;
- dégradation fonctionnelle.

Les opérations critiques doivent pouvoir être priorisées par rapport aux tâches analytiques ou non urgentes.

## 34. Statut public et communication

Lorsque pertinent, Mansa peut publier une page de statut séparant :

- API ;
- applications ;
- paiements cartes ;
- Mobile Money ;
- transferts ;
- notifications ;
- services partenaires ;
- portail administrateur.

La page de statut ne doit pas révéler d’informations exploitables par un attaquant.

## 35. Communication incident

Les communications doivent distinguer :

- interne ;
- partenaires ;
- clients ;
- autorités ;
- équipes support.

Une communication externe doit préciser ce qui est connu, l’impact, les contournements disponibles et l’état de résolution sans spéculation ni données sensibles.

## 36. Postmortem

Tout incident significatif doit produire un postmortem sans recherche de coupable.

Contenu minimal :

- résumé ;
- impact ;
- chronologie ;
- détection ;
- cause racine ;
- facteurs contributifs ;
- mesures immédiates ;
- actions correctives ;
- responsables ;
- échéances ;
- tests ajoutés ;
- modifications de runbook ;
- enseignements.

Les actions doivent être suivies jusqu’à clôture.

## 37. Sécurité et incidents

Un incident opérationnel peut devenir un incident de sécurité.

La plateforme doit permettre une escalade vers le processus sécurité en cas de :

- accès non autorisé ;
- fuite de secret ;
- exfiltration ;
- modification de données ;
- fraude ;
- attaque DDoS ;
- ransomware ;
- comportement administrateur anormal ;
- compromission partenaire.

Les preuves utiles doivent être conservées selon les règles légales et de sécurité.

## 38. Multi-tenant

L’observabilité doit respecter l’isolation multi-tenant.

Un client ou partenaire ne voit que :

- ses métriques autorisées ;
- ses logs autorisés ;
- ses webhooks ;
- ses incidents contractuels ;
- ses quotas ;
- ses SLA.

Les dashboards internes globaux restent réservés aux équipes autorisées.

## 39. Données et rétention

Les durées de conservation doivent être configurées par type :

- logs techniques ;
- traces ;
- métriques ;
- événements sécurité ;
- événements financiers ;
- incidents ;
- audits ;
- données matérielles.

Les données volumineuses d’observabilité ne doivent pas être conservées indéfiniment sans justification.

## 40. Dashboards de référence

Dashboards recommandés :

```text
Executive Reliability
Payments
Wallet & Ledger
Authentication
Mobile Money
Card Acquiring
Agents
KYC
API Partners
Notifications
Database
Queues
Infrastructure
State Services
Toll Operations
Security Operations
```

Chaque dashboard doit avoir un propriétaire et une finalité claire.

## 41. Portail Admin

Menus recommandés :

```text
Operations
├── Service Health
├── SLO & Error Budgets
├── Incidents
├── Alerts
├── Dependencies
├── Partner Health
├── Deployments
├── Feature Flags
├── Queues
├── Jobs
├── Backups
├── Disaster Recovery
├── Capacity
├── Runbooks
└── Audit
```

Les actions sensibles du portail exigent des permissions dédiées.

## 42. Modèle de données minimal

Entités recommandées :

```text
Service
ServiceDependency
ServiceLevelObjective
ServiceLevelIndicator
ErrorBudget
HealthCheck
AlertRule
AlertEvent
Incident
IncidentTimelineEvent
IncidentParticipant
Runbook
DeploymentEvent
FeatureFlag
BackupJob
RestoreTest
DisasterRecoveryPlan
ContinuityExercise
CapacitySnapshot
PartnerHealthEvent
OperationalAuditLog
```

## 43. APIs internes

Exemples :

```text
GET /internal/operations/services
GET /internal/operations/services/{id}/health
GET /internal/operations/slo
GET /internal/operations/incidents
POST /internal/operations/incidents
PATCH /internal/operations/incidents/{id}
POST /internal/operations/incidents/{id}/timeline
GET /internal/operations/dependencies
GET /internal/operations/backups
POST /internal/operations/restore-tests
```

Ces APIs ne doivent pas être exposées publiquement sans authentification et autorisation adaptées.

## 44. Automatisation

Le système peut automatiser :

- création d’incident à partir d’une alerte critique ;
- regroupement d’alertes corrélées ;
- enrichissement avec dernier déploiement ;
- création de timeline ;
- ouverture de ticket ;
- déclenchement de runbook sûr ;
- bascule contrôlée ;
- notification d’équipe ;
- génération de rapport.

Une automatisation ne doit jamais effectuer une action irréversible à fort risque sans garde-fous appropriés.

## 45. IA et opérations

Jini ou une IA interne peut aider à :

- résumer un incident ;
- corréler logs et métriques ;
- proposer un runbook ;
- expliquer une anomalie ;
- générer un postmortem préliminaire ;
- détecter des tendances.

L’IA ne doit pas :

- inventer un état de service ;
- masquer une alerte ;
- désactiver une protection ;
- exécuter seule une action destructrice ;
- accéder à des secrets non nécessaires.

## 46. Tests obligatoires

Le module doit être couvert par :

- tests de métriques ;
- tests de propagation `traceId` ;
- tests de redaction de logs ;
- tests de health checks ;
- tests d’idempotence ;
- tests de retry ;
- tests circuit breaker ;
- tests files/DLQ ;
- tests mode dégradé ;
- tests de backup ;
- tests de restore ;
- tests de failover ;
- tests de permissions Operations ;
- tests multi-tenant ;
- tests de notification d’incident.

## 47. Critères d’acceptation

Le module est considéré prêt lorsqu’au minimum :

1. tous les services critiques émettent logs, métriques et traces exploitables ;
2. aucun secret n’apparaît dans les logs de test ;
3. les transactions financières sont corrélables de bout en bout ;
4. les SLO critiques sont définis ;
5. les alertes critiques ont un runbook ;
6. les incidents disposent d’un workflow et d’un audit ;
7. les sauvegardes sont surveillées ;
8. une restauration de test réussit ;
9. les RTO/RPO sont documentés par service critique ;
10. les dépendances partenaires utilisent des politiques de timeout/retry cohérentes ;
11. les modes dégradés critiques sont documentés ;
12. les opérations péage hors ligne se resynchronisent sans double débit ;
13. un exercice de continuité est réalisé avant un lancement à grande échelle ;
14. les dashboards principaux sont accessibles aux rôles autorisés ;
15. les postmortems peuvent être suivis jusqu’à clôture des actions.

## 48. Hors périmètre initial

Ne sont pas imposés dès le premier pilote :

- multi-région active-active pour tous les services ;
- chaos engineering permanent en production ;
- SLA public identique pour tous les produits ;
- conservation illimitée de toutes les traces ;
- automatisation autonome de toute remédiation.

Ces capacités peuvent être introduites progressivement selon la criticité, le volume et les contrats.

## 49. Résultat attendu

Mansa doit disposer d’une exploitation capable de répondre rapidement aux questions suivantes :

- le service fonctionne-t-il réellement ?
- quel utilisateur, tenant, partenaire ou pays est affecté ?
- depuis quand ?
- quel changement a précédé l’incident ?
- y a-t-il un risque financier ou de double débit ?
- quelles transactions sont dans un état incertain ?
- quel mode dégradé est disponible ?
- peut-on restaurer les données ?
- le RTO/RPO est-il respecté ?
- quelles actions empêchent la récidive ?

La fiabilité, la sécurité et l’intégrité financière doivent rester prioritaires sur la simple disponibilité apparente.
