# Mansa — Observabilité, SRE, monitoring, alerting et traçabilité technique

## 1. Objet

Ce document définit le socle d’observabilité et de Site Reliability Engineering de Mansa. Il couvre les métriques, logs, traces distribuées, événements techniques, tableaux de bord, alertes, SLO/SLA, astreinte, diagnostic, capacité, disponibilité, performance, santé des dépendances et suivi des opérations critiques.

L’objectif est de rendre chaque service Mansa observable sans dépendre d’un fournisseur unique, de détecter rapidement les incidents, de réduire le temps moyen de résolution, de protéger les flux financiers et de garantir une continuité de service mesurable.

Ce module s’applique à :

- API et backend ;
- applications mobiles ;
- portails web ;
- services de paiement ;
- wallets et ledger ;
- KYC/KYB ;
- agents ;
- commerce ;
- secteur public ;
- péages et mobilité ;
- Jini Voice ;
- notifications ;
- intégrations partenaires ;
- bases de données ;
- files/queues ;
- caches ;
- stockage objet ;
- infrastructure ;
- TPE, bornes, contrôleurs de voie et autres équipements gérés par Mansa.

## 2. Principes directeurs

Le socle d’observabilité doit respecter les principes suivants :

1. observabilité par défaut pour tout nouveau service ;
2. corrélation de bout en bout d’une requête ou transaction ;
3. aucune donnée sensible inutile dans les logs ;
4. aucune donnée carte sensible, PIN, secret, clé ou token complet dans les journaux ;
5. séparation claire entre logs techniques, événements d’audit et données métier ;
6. horodatage cohérent et synchronisé ;
7. dashboards adaptés aux rôles ;
8. alertes actionnables plutôt que bruit permanent ;
9. haute priorité aux flux financiers, identités, paiements et autorisations ;
10. support multi-pays, multi-tenant et multi-environnement ;
11. portabilité entre fournisseurs grâce à des standards ouverts ;
12. conservation configurable selon criticité, coûts et obligations applicables.

## 3. Architecture de référence

Architecture logique recommandée :

```text
Applications / Services / Equipements
        │
        ├── Metrics
        ├── Logs
        ├── Traces
        └── Technical Events
                │
                v
      Collecteurs / Agents locaux
                │
                v
      Pipeline d’observabilité
                │
        ┌───────┼────────┐
        v       v        v
    Metrics    Logs     Traces
        │       │        │
        └───────┼────────┘
                v
      Dashboards / Alerting
                │
        ┌───────┼─────────────┐
        v       v             v
      SRE      SOC         Exploitation
```

L’implémentation peut utiliser OpenTelemetry pour l’instrumentation, avec des backends interchangeables compatibles métriques, traces et logs.

## 4. Standard OpenTelemetry

Mansa doit privilégier OpenTelemetry pour :

- génération de traces ;
- propagation du contexte ;
- métriques applicatives ;
- instrumentation HTTP ;
- instrumentation base de données ;
- instrumentation des files de messages ;
- corrélation entre logs et traces ;
- export vers plusieurs backends.

L’utilisation d’OpenTelemetry ne doit pas rendre Mansa dépendant d’un seul éditeur de monitoring.

## 5. Identifiants de corrélation

Chaque requête ou opération significative doit pouvoir porter :

```text
traceId
spanId
requestId
correlationId
transactionId
organizationId
countryCode
environment
serviceName
serviceVersion
```

Les identifiants métier sensibles ne doivent être exposés que lorsque nécessaire et selon une politique de masquage.

Une transaction financière doit pouvoir être suivie depuis le canal d’entrée jusqu’au résultat final sans journaliser de secrets.

## 6. Logs structurés

Les logs doivent être structurés, idéalement JSON, et contenir au minimum :

- timestamp ;
- niveau ;
- service ;
- version ;
- environnement ;
- message ;
- traceId ;
- requestId si disponible ;
- organisation ou tenant lorsque autorisé ;
- code pays lorsque pertinent ;
- catégorie d’événement ;
- code d’erreur ;
- durée ;
- résultat ;
- composant dépendant si concerné.

Niveaux recommandés :

```text
TRACE
DEBUG
INFO
WARN
ERROR
FATAL
```

Les environnements de production ne doivent pas activer durablement un niveau verbeux contenant des données supplémentaires sans justification.

## 7. Données interdites dans les logs

Il est interdit de journaliser en clair :

- PIN ;
- CVV/CVC ;
- clés privées ;
- secrets API ;
- mots de passe ;
- tokens complets ;
- refresh tokens ;
- données de bande magnétique ;
- cryptogrammes ;
- données biométriques brutes ;
- documents KYC complets ;
- enregistrements vocaux complets sans politique explicite ;
- numéros de carte complets lorsque non nécessaires.

Les PAN éventuellement nécessaires à des fins de diagnostic doivent être masqués conformément aux règles de sécurité carte applicables.

## 8. Redaction et masquage

Le pipeline doit supporter :

- masquage de champs ;
- suppression de champs ;
- hachage contrôlé ;
- pseudonymisation ;
- filtrage avant ingestion ;
- règles spécifiques par type de service.

Une donnée sensible ne doit pas être envoyée puis supprimée uniquement dans le dashboard : le filtrage doit intervenir le plus tôt possible.

## 9. Métriques techniques minimales

Chaque service doit exposer :

- disponibilité ;
- nombre de requêtes ;
- taux de succès ;
- taux d’erreur ;
- latence p50 ;
- latence p95 ;
- latence p99 ;
- taux de timeout ;
- saturation ;
- CPU ;
- mémoire ;
- espace disque lorsque pertinent ;
- nombre de connexions ;
- pool base de données ;
- file d’attente ;
- retries ;
- circuit breakers ;
- dépendances externes.

## 10. Métriques métier critiques

Les dashboards opérationnels doivent distinguer métriques techniques et métriques métier.

Exemples :

```text
payments_attempted_total
payments_authorized_total
payments_failed_total
payments_reversed_total
transfers_created_total
transfers_completed_total
wallet_operations_total
ledger_postings_total
cash_deposits_total
cash_withdrawals_total
kyc_submissions_total
kyc_failures_total
notifications_sent_total
notifications_failed_total
```

Les métriques financières doivent être conçues sans créer une nouvelle source comptable concurrente du ledger.

## 11. Métriques de dépendances

Chaque dépendance externe doit être suivie séparément :

- banque partenaire ;
- processeur de paiement ;
- acquéreur ;
- réseau carte ;
- Mobile Money ;
- fournisseur SMS ;
- e-mail ;
- push ;
- fournisseur KYC ;
- stockage ;
- fournisseur cloud ;
- téléphonie ;
- API État ;
- matériel connecté.

Pour chaque dépendance :

```text
availability
latency
success_rate
timeout_rate
error_rate
rate_limit_events
retry_count
circuit_breaker_state
```

## 12. Traces distribuées

Les traces doivent permettre de reconstruire un parcours distribué.

Exemple :

```text
Client mobile
→ API Gateway
→ Auth
→ Risk Engine
→ Payment Orchestrator
→ Provider externe
→ Ledger
→ Notification
```

Chaque span doit indiquer :

- service ;
- opération ;
- durée ;
- résultat ;
- erreur éventuelle ;
- dépendance appelée ;
- retry éventuel.

Les payloads sensibles ne doivent pas être enregistrés dans les spans.

## 13. Transactions financières

Pour les paiements, virements, dépôts, retraits et opérations ledger, l’observabilité doit permettre de distinguer :

```text
RECEIVED
VALIDATED
AUTHORIZED
PROCESSING
PROVIDER_PENDING
POSTED_TO_LEDGER
COMPLETED
FAILED
REVERSED
CANCELLED
TIMED_OUT
```

Une alerte doit être possible lorsque :

- un taux anormal d’opérations reste en `PENDING` ;
- une autorisation réussit mais l’écriture ledger attendue n’arrive pas ;
- un provider renvoie des erreurs en masse ;
- un volume inhabituel de reversals apparaît ;
- un écart de rapprochement est détecté.

## 14. Idempotence et double traitement

Les dashboards doivent suivre :

- requêtes avec clé d’idempotence ;
- clés réutilisées ;
- doublons détectés ;
- doublons bloqués ;
- retries fournisseurs ;
- transactions réconciliées après timeout.

Une augmentation brutale des doublons doit déclencher une investigation.

## 15. Base de données

Pour PostgreSQL et services associés :

- connexions actives ;
- connexions maximales ;
- temps d’attente du pool ;
- requêtes lentes ;
- deadlocks ;
- erreurs ;
- réplication ;
- lag de réplication ;
- taille ;
- croissance ;
- vacuum/autovacuum ;
- transactions longues ;
- saturation disque ;
- taux d’écriture/lecture.

Les requêtes journalisées ne doivent pas exposer de données sensibles.

## 16. Redis et caches

Suivre :

- hit ratio ;
- miss ratio ;
- mémoire ;
- évictions ;
- connexions ;
- latence ;
- erreurs ;
- clés expirées ;
- réplication si utilisée ;
- indisponibilité ou failover.

Une panne Redis ne doit pas être confondue avec une perte de données financières si Redis n’est pas la source de vérité.

## 17. Queues et messagerie

Pour chaque file :

- profondeur ;
- âge du message le plus ancien ;
- taux entrant ;
- taux sortant ;
- retry ;
- dead-letter queue ;
- nombre de consommateurs ;
- lag ;
- messages en erreur.

Les DLQ critiques doivent générer des alertes actionnables.

## 18. Applications mobiles

L’observabilité mobile doit couvrir :

- crash-free sessions ;
- crash-free users ;
- erreurs réseau ;
- temps de démarrage ;
- lenteurs majeures ;
- version de l’application ;
- version OS ;
- type de terminal lorsque nécessaire ;
- connectivité ;
- synchronisation hors ligne ;
- taux de succès des mises à jour critiques.

Les données de télémétrie mobile doivent respecter les règles de confidentialité et minimisation.

## 19. Portails web

Suivre :

- disponibilité ;
- erreurs frontend ;
- Core Web Vitals lorsque pertinent ;
- appels API ;
- erreurs d’authentification ;
- erreurs de permissions ;
- échecs de chargement ;
- version déployée ;
- erreurs JavaScript.

## 20. Matériel connecté

Le portail d’exploitation doit suivre les équipements :

```text
ONLINE
OFFLINE
DEGRADED
MAINTENANCE
DISABLED
```

Pour chaque terminal ou borne :

- dernière communication ;
- version firmware ;
- version application ;
- température si disponible ;
- alimentation ;
- batterie/UPS si disponible ;
- connectivité ;
- erreurs périphériques ;
- disponibilité imprimante ;
- disponibilité scanner ;
- disponibilité TPE ;
- état cash validator/recycler lorsque applicable ;
- état relais/barrière/capteurs lorsque applicable.

## 21. Péages — exigences de référence

Pour toute observabilité liée au domaine péage, Mansa doit préserver les décisions de référence suivantes :

- coexistence du péage automatique classique avec barrière et du télépéage RFID avec barrière ;
- évolution future optionnelle vers le free-flow sans supprimer les deux solutions initiales ;
- paiement classique configurable par billets et pièces FCFA, carte EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money ;
- Mobile Money activable ou désactivable par administration au niveau national, réseau, poste ou voie, avec date d’effet et audit ;
- télépéage initial par tags UHF RFID passifs associés à un véhicule et à un compte ;
- lecteur/antenne, contrôleur local, relais OPEN, barrière et capteurs de passage ;
- fonctionnement local/hors ligne sécurisé avec resynchronisation et absence de double débit ;
- matériel multi-fournisseurs derrière adaptateurs ;
- trois niveaux d’équipement : automatique complet, semi-automatique, poste numérisé à faible coût ;
- déploiement progressif ;
- matériel acheté par État/concessionnaire ou fourni/intégré/revendu par Mansa ;
- marque blanche État/concessionnaire ;
- rapprochement anti-corruption véhicule → catégorie → tarif → paiement → ouverture → passage physique.

## 22. Métriques péage

Exemples de métriques :

```text
toll_vehicle_detected_total
toll_rfid_reads_total
toll_anpr_reads_total
toll_payments_total
toll_cash_payments_total
toll_card_payments_total
toll_mobile_money_payments_total
toll_barrier_open_total
toll_manual_open_total
toll_passages_total
toll_unmatched_passages_total
toll_offline_transactions_total
toll_sync_failures_total
```

Une alerte doit être produite lorsque l’écart entre véhicules détectés, transactions, ouvertures et passages dépasse un seuil configurable.

## 23. Observabilité anti-corruption péage

Les tableaux de bord doivent permettre de rapprocher :

```text
véhicule détecté
→ classe véhicule
→ tarif attendu
→ moyen de paiement
→ paiement confirmé
→ commande OPEN
→ ouverture réelle
→ passage physique
```

Les anomalies suivantes doivent être visibles :

- ouverture sans paiement ni abonnement valide ;
- ouverture manuelle répétée ;
- catégorie véhicule modifiée anormalement ;
- passage sans transaction ;
- transaction sans passage ;
- tarif appliqué inférieur au tarif attendu ;
- échec fréquent d’un périphérique cash ;
- période hors ligne anormalement longue.

## 24. SLO — Service Level Objectives

Chaque service critique doit définir des SLO mesurables.

Exemples :

```text
API availability >= 99.95 %
Payment API success path latency p95 < 800 ms hors fournisseur externe
Authentication p95 < 500 ms
Critical webhook processing >= 99.9 % dans la fenêtre définie
Ledger posting internal success >= 99.99 % hors rejet métier attendu
```

Les valeurs sont configurées par service et environnement et ne doivent pas être considérées comme contractuelles tant qu’elles ne sont pas validées.

## 25. SLI — Service Level Indicators

SLI recommandés :

- disponibilité ;
- latence ;
- exactitude ;
- fraîcheur ;
- complétude ;
- taux de succès ;
- délai de traitement ;
- taux de perte ;
- taux de synchronisation ;
- temps de récupération.

## 26. Error budget

Chaque SLO peut être associé à un budget d’erreur.

Lorsqu’un service consomme trop rapidement son budget :

- gel temporaire de changements risqués ;
- priorité aux correctifs de fiabilité ;
- revue de capacité ;
- analyse des incidents ;
- décision d’exploitation documentée.

## 27. Dashboards

Dashboards minimaux :

```text
Executive Reliability
Platform Health
Payments
Ledger & Wallets
Authentication & Identity
KYC / Compliance
Agents
Commerce
Notifications
Mobile Apps
Databases
Queues
External Providers
Public Sector
Toll & Mobility
Devices Fleet
Security Operations
```

Chaque dashboard doit indiquer l’environnement et la période observée.

## 28. Dashboard exécutif

Il doit rester synthétique :

- disponibilité globale ;
- incidents majeurs ;
- SLO à risque ;
- volume transactionnel ;
- taux de succès ;
- dépendances dégradées ;
- évolution des erreurs ;
- services critiques hors SLO.

Il ne doit pas exposer des détails techniques sensibles à des rôles non autorisés.

## 29. Alerting

Une alerte doit être :

- pertinente ;
- actionnable ;
- priorisée ;
- liée à un runbook ;
- dédupliquée ;
- routée vers la bonne équipe ;
- contextualisée.

Sévérités recommandées :

```text
SEV0 — incident systémique / sécurité critique / fonds à risque
SEV1 — service critique fortement impacté
SEV2 — dégradation importante
SEV3 — anomalie limitée
SEV4 — information / suivi
```

## 30. Exemples d’alertes critiques

- API paiement indisponible ;
- ledger indisponible ;
- déséquilibre comptable détecté ;
- forte hausse des échecs d’authentification ;
- provider bancaire principal indisponible ;
- webhook financier bloqué ;
- DLQ financière en croissance ;
- base de données proche saturation ;
- réplication en retard critique ;
- pics de reversals ;
- fort taux de doubles requêtes ;
- perte de communication massive TPE/bornes ;
- péage : ouvertures manuelles ou passages non rapprochés au-dessus du seuil.

## 31. Anti-bruit

Les alertes doivent utiliser :

- fenêtres temporelles ;
- seuils relatifs ;
- seuils absolus ;
- agrégation ;
- déduplication ;
- suppression pendant maintenance ;
- corrélation d’incidents ;
- burn rate SLO.

Une alerte qui ne nécessite jamais d’action doit être revue ou supprimée.

## 32. Runbooks

Chaque alerte critique doit pointer vers un runbook comprenant :

- description ;
- impact ;
- causes probables ;
- vérifications initiales ;
- commandes ou dashboards autorisés ;
- procédure de mitigation ;
- procédure d’escalade ;
- rollback ;
- contacts ou équipe responsable ;
- éléments à collecter pour post-mortem.

Les runbooks ne doivent pas contenir de secrets.

## 33. Astreinte et escalade

Le système doit supporter une politique d’astreinte :

```text
Primary On-call
Secondary On-call
Service Owner
Security / SOC si pertinent
Incident Commander pour incident majeur
```

Les délais d’escalade varient selon la sévérité.

## 34. Incident management

Pour chaque incident majeur :

- identifiant ;
- sévérité ;
- service ;
- début ;
- détection ;
- accusé de prise en charge ;
- mitigation ;
- résolution ;
- impact ;
- utilisateurs affectés ;
- transactions affectées ;
- cause racine ;
- actions correctives ;
- responsable ;
- statut.

## 35. MTTA, MTTD et MTTR

Mansa doit suivre :

- MTTD : Mean Time To Detect ;
- MTTA : Mean Time To Acknowledge ;
- MTTR : Mean Time To Resolve/Recover.

Ces indicateurs servent à améliorer les processus et non à sanctionner automatiquement les équipes.

## 36. Maintenance planifiée

Les fenêtres de maintenance doivent être enregistrées afin de :

- éviter les faux positifs ;
- maintenir la visibilité ;
- distinguer indisponibilité planifiée et incident ;
- comparer résultat réel et fenêtre prévue.

Une maintenance ne doit pas masquer un incident indépendant.

## 37. Déploiements et observabilité

Chaque déploiement doit être annoté dans les dashboards :

- service ;
- version ;
- commit SHA ;
- environnement ;
- heure ;
- méthode de rollout ;
- auteur ou pipeline ;
- feature flags modifiés.

Cela permet de corréler une hausse d’erreurs avec un changement récent.

## 38. Feature flags

Les changements critiques de feature flags doivent produire des événements d’observabilité :

- flag ;
- ancienne valeur ;
- nouvelle valeur ;
- portée ;
- auteur ;
- date ;
- environnement.

Aucun secret ne doit apparaître dans ces événements.

## 39. Capacity planning

Le système doit suivre les tendances de :

- CPU ;
- mémoire ;
- stockage ;
- volume de requêtes ;
- volume transactionnel ;
- croissance base ;
- débit queues ;
- connexions ;
- appareils actifs ;
- utilisateurs actifs ;
- croissance pays/tenant.

Des seuils prédictifs peuvent prévenir la saturation avant incident.

## 40. Multi-région et multi-pays

Les métriques doivent pouvoir être segmentées par :

- région technique ;
- pays ;
- organisation ;
- environnement ;
- provider ;
- produit ;
- canal.

Il faut éviter une cardinalité excessive pouvant rendre le monitoring trop coûteux ou instable.

## 41. Multi-tenant

Le monitoring multi-tenant doit respecter l’isolation :

- aucune organisation ne voit les métriques privées d’une autre ;
- les dashboards internes agrégés sont réservés aux rôles autorisés ;
- les identifiants tenant dans la télémétrie sont minimisés ;
- les exports client sont filtrés par portée.

## 42. Audit vs logs techniques

Les logs techniques ne remplacent pas l’AuditLog métier.

Un événement de sécurité ou d’administration nécessitant une preuve durable doit être écrit dans le système d’audit prévu, même s’il apparaît également dans les logs techniques.

## 43. Conservation

Les durées de conservation doivent être configurables par classe :

```text
HOT
WARM
ARCHIVE
DELETE
```

Les logs très détaillés peuvent avoir une durée plus courte que les événements d’audit réglementaires.

## 44. Coûts d’observabilité

Pour contrôler les coûts :

- sampling des traces ;
- sampling adaptatif ;
- réduction des logs DEBUG ;
- limitation de cardinalité ;
- agrégation ;
- rétention par niveau ;
- compression ;
- archivage.

Les transactions critiques en erreur peuvent utiliser un taux d’échantillonnage supérieur aux transactions saines.

## 45. Sampling des traces

Politique possible :

```text
100 % des erreurs critiques
100 % des transactions à forte valeur selon politique
100 % des parcours sécurité sensibles
X % des requêtes normales
sampling adaptatif lors d’un incident
```

Le sampling ne doit pas empêcher l’investigation d’un incident majeur.

## 46. Sécurité du système d’observabilité

Le système d’observabilité est lui-même sensible.

Il doit disposer de :

- authentification forte ;
- RBAC ;
- séparation des rôles ;
- journaux d’accès ;
- chiffrement en transit ;
- chiffrement au repos lorsque applicable ;
- restrictions réseau ;
- rotation des identifiants ;
- export contrôlé ;
- sauvegarde de configuration.

## 47. Accès développeur

Un développeur ne doit pas disposer automatiquement d’un accès illimité aux logs de production.

Les accès doivent être :

- liés au rôle ;
- temporaires lorsque nécessaire ;
- audités ;
- limités aux environnements appropriés ;
- masqués pour les données sensibles.

## 48. Observabilité sécurité

Les événements suivants doivent alimenter les systèmes SOC/SIEM selon politique :

- échecs répétés d’authentification ;
- élévation de privilèges ;
- changement de rôle ;
- révocation ;
- rotation de clés ;
- anomalie d’accès ;
- erreurs WAF ;
- blocages rate limit ;
- comportements suspects ;
- accès administratifs critiques.

## 49. Tests d’observabilité

Les tests doivent vérifier :

- présence du `traceId` ;
- propagation de contexte ;
- absence de secrets dans les logs ;
- émission des métriques critiques ;
- fonctionnement des alertes ;
- lien alerte → runbook ;
- dashboards après déploiement ;
- capacité à identifier la version fautive.

## 50. Tests de panne

En environnement adapté, simuler :

- base indisponible ;
- Redis indisponible ;
- provider externe lent ;
- timeout bancaire ;
- file saturée ;
- perte réseau ;
- terminal hors ligne ;
- borne hors ligne ;
- synchronisation retardée.

Le système doit produire des signaux compréhensibles et cohérents avec la panne réelle.

## 51. Synthetic monitoring

Des sondes synthétiques peuvent vérifier :

- page publique ;
- endpoint santé ;
- authentification de test dédiée ;
- parcours paiement simulé non financier ;
- disponibilité API ;
- disponibilité régionale.

Les comptes et données synthétiques doivent être clairement séparés des vrais utilisateurs.

## 52. Health checks

Les services doivent exposer des checks distincts lorsque pertinent :

```text
/liveness
/readiness
/health
```

Un service peut être vivant mais non prêt à recevoir du trafic.

## 53. Dépendances et readiness

La readiness ne doit pas obligatoirement échouer pour toute dépendance secondaire.

Exemple : une panne du fournisseur e-mail ne doit pas nécessairement rendre indisponible l’API paiement.

Les dépendances critiques et non critiques doivent être classifiées.

## 54. Statuts publics

Une page de statut externe peut présenter :

- API ;
- paiements ;
- applications ;
- notifications ;
- services partenaires ;
- maintenance ;
- incidents.

Elle ne doit pas révéler d’informations exploitables par un attaquant.

## 55. Communication incident

Les incidents majeurs peuvent produire des mises à jour structurées :

```text
Investigating
Identified
Monitoring
Resolved
```

Le contenu public doit être distinct des détails internes.

## 56. Reporting SRE

Rapport périodique :

- disponibilité par service ;
- respect SLO ;
- budget d’erreur ;
- incidents ;
- MTTA/MTTR ;
- principales causes ;
- capacité ;
- dette de fiabilité ;
- dépendances problématiques ;
- actions correctives.

## 57. Modèle de données minimal

Entités possibles :

```text
ServiceCatalogEntry
ServiceSlo
ServiceSli
ErrorBudget
MonitoringDashboard
AlertRule
AlertEvent
Incident
IncidentTimelineEvent
Runbook
OnCallPolicy
MaintenanceWindow
DependencyHealth
DeploymentMarker
SyntheticCheck
DeviceHealthSnapshot
```

## 58. Service Catalog

Chaque service doit être inscrit dans un catalogue :

- nom ;
- propriétaire ;
- équipe ;
- criticité ;
- dépôt ;
- documentation ;
- dashboards ;
- alertes ;
- SLO ;
- dépendances ;
- runbook ;
- environnements ;
- données manipulées.

Un service sans propriétaire clairement identifié est une anomalie opérationnelle.

## 59. Criticité

Classification recommandée :

```text
TIER_0 — ledger, identité racine, orchestration financière critique
TIER_1 — paiements, wallets, transferts, KYC critique, réseau agents
TIER_2 — services métier importants
TIER_3 — services secondaires
```

Les exigences SLO, alerting et astreinte peuvent varier selon le tier.

## 60. Gouvernance

Toute modification des :

- SLO ;
- alertes critiques ;
- règles de rétention ;
- accès production ;
- dashboards réglementaires ;
- politiques de masquage ;
- intégrations SIEM ;

doit être versionnée et auditable.

## 61. Critères d’acceptation

Le module est considéré prêt lorsque :

- chaque service critique émet métriques, logs structurés et traces ;
- les transactions sont corrélables de bout en bout ;
- aucun secret n’est journalisé ;
- les dashboards critiques existent ;
- les alertes critiques ont un runbook ;
- les SLO sont définis pour les services Tier 0 et Tier 1 ;
- les incidents sont suivis ;
- les équipements critiques ont un statut exploitable ;
- les dépendances externes sont visibles ;
- les flux péage permettent le rapprochement véhicule/paiement/ouverture/passage ;
- la télémétrie est multi-tenant et respecte les règles de confidentialité ;
- la solution reste portable entre fournisseurs d’observabilité.

## 62. Résultat attendu

Mansa doit pouvoir répondre rapidement à des questions telles que :

- Quel service est en panne ?
- Depuis quand ?
- Quel pays ou tenant est touché ?
- Quelle version a introduit l’erreur ?
- Quel provider ralentit le paiement ?
- Combien de transactions sont bloquées ?
- Existe-t-il un risque de double traitement ?
- Le ledger a-t-il reçu l’écriture attendue ?
- Quels terminaux ou bornes sont hors ligne ?
- Au péage, combien de véhicules ont franchi la barrière sans transaction rapprochée ?
- Quel runbook doit être exécuté ?

L’observabilité doit devenir un composant natif de l’architecture Mansa et non un ajout tardif après mise en production.
