# Cahier des charges — Observabilité, SRE, supervision et gestion des incidents

## 1. Objet

Ce document définit les exigences Mansa pour l’observabilité technique et métier, la supervision temps réel, les SLO/SLA, l’astreinte, la gestion des incidents, la traçabilité opérationnelle et l’amélioration continue.

L’objectif est de rendre l’ensemble de la plateforme mesurable, diagnosable et exploitable en production sans dépendre d’un seul fournisseur d’outillage.

Ce domaine couvre les applications client, commerçant, TPE, Admin Lite, portails web, API, services backend, bases de données, files de messages, caches, intégrations bancaires, Mobile Money, partenaires cartes, services État, agents, péages, télépéage, Jini Voice et tous les futurs modules Mansa.

## 2. Principes

L’observabilité repose sur quatre familles principales de signaux :

- logs structurés ;
- métriques ;
- traces distribuées ;
- événements métier/audit.

Le système doit permettre de répondre rapidement aux questions suivantes :

- le service fonctionne-t-il ?
- les utilisateurs peuvent-ils réellement terminer leur parcours ?
- où se situe la dégradation ?
- depuis quand ?
- quel tenant, pays, partenaire ou canal est concerné ?
- quel changement récent peut être corrélé ?
- existe-t-il un impact financier ou réglementaire ?
- faut-il dégrader, désactiver ou basculer une fonctionnalité ?

## 3. Architecture multi-fournisseurs

Mansa ne doit pas dépendre obligatoirement d’une solution unique d’observabilité.

Les composants doivent exposer des formats et protocoles standards lorsque possible :

```text
OpenTelemetry
OTLP
Prometheus-compatible metrics
structured JSON logs
W3C Trace Context
standard HTTP health/readiness endpoints
webhooks / event streams
```

Les outils de stockage, visualisation, alerting ou APM doivent rester remplaçables derrière des interfaces ou pipelines documentés.

## 4. Identifiants de corrélation

Chaque requête et opération significative doit pouvoir être corrélée de bout en bout.

Identifiants recommandés :

```text
trace_id
span_id
request_id
correlation_id
transaction_id
payment_id
ledger_entry_id
session_id
tenant_id
organization_id
country_code
device_id
partner_id
```

Les identifiants sensibles ne doivent pas être utilisés directement lorsqu’une pseudonymisation ou un identifiant technique suffit.

## 5. Logs structurés

Les logs de production doivent être structurés et exploitables automatiquement.

Champs minimaux recommandés :

```text
timestamp
service
version
environment
level
message
trace_id
request_id
tenant_id
country_code
operation
result
error_code
latency_ms
```

Les erreurs doivent distinguer au minimum :

```text
VALIDATION
AUTHENTICATION
AUTHORIZATION
BUSINESS_RULE
PARTNER_TIMEOUT
PARTNER_REJECTION
DATABASE
NETWORK
RATE_LIMIT
FRAUD_BLOCK
CONFIGURATION
INTERNAL
```

## 6. Données interdites dans les logs

Les logs ne doivent jamais contenir en clair :

- PIN ;
- CVV/CVC ;
- mots de passe ;
- secrets API ;
- clés privées ;
- tokens complets ;
- données de piste carte ;
- PAN complet lorsque non nécessaire ;
- biométrie brute ;
- pièces KYC complètes ;
- contenu sensible d’appels ou messages au-delà des politiques de conservation autorisées.

Des mécanismes automatiques de redaction doivent être activés avant ingestion lorsque nécessaire.

## 7. Métriques techniques

Chaque service doit publier des métriques de santé et de capacité.

Exemples :

```text
request_rate
error_rate
latency_p50
latency_p95
latency_p99
cpu_usage
memory_usage
queue_depth
db_connections
cache_hit_ratio
worker_lag
retry_count
timeout_count
circuit_breaker_state
```

Les métriques doivent être segmentables sans créer de cardinalité incontrôlée.

## 8. Métriques métier

La supervision doit mesurer l’expérience réelle et les flux financiers.

Exemples :

```text
payment_success_rate
payment_decline_rate
wallet_transfer_success_rate
ledger_posting_delay
cash_in_success_rate
cash_out_success_rate
card_authorization_success_rate
mobile_money_success_rate
kyc_completion_rate
agent_transaction_success_rate
receipt_delivery_rate
webhook_delivery_success_rate
```

Une baisse métier peut déclencher une alerte même lorsque les serveurs paraissent techniquement sains.

## 9. Observabilité des paiements

Pour chaque canal de paiement, Mansa doit distinguer :

- demande reçue ;
- validation locale ;
- appel partenaire ;
- réponse partenaire ;
- écriture ledger ;
- confirmation utilisateur ;
- webhook éventuel ;
- rapprochement ultérieur.

Les tableaux de bord doivent pouvoir séparer les résultats par acquéreur, banque, Mobile Money, réseau carte, pays, tenant et type de transaction.

Un incident partenaire ne doit pas être confondu avec une panne Mansa.

## 10. Observabilité du ledger

Le ledger est un composant critique.

Surveillance minimale :

```text
posting_latency
unbalanced_attempts
idempotency_conflicts
duplicate_attempts
reconciliation_mismatches
pending_transactions
failed_postings
```

Toute impossibilité de garantir l’intégrité comptable doit déclencher une alerte prioritaire.

## 11. Traces distribuées

Les flux multi-services doivent propager un contexte de trace.

Exemple :

```text
mobile/web
→ API gateway
→ identity
→ payment orchestration
→ risk engine
→ partner adapter
→ ledger
→ notification
```

Les appels externes doivent apparaître comme des spans identifiables avec durée, statut et partenaire concerné, sans exposer de données sensibles.

## 12. SLI, SLO et SLA

Mansa doit distinguer :

- SLI : indicateur réellement mesuré ;
- SLO : objectif interne ;
- SLA : engagement contractuel éventuel.

SLO possibles par service :

```text
availability
successful_request_ratio
payment_success_ratio
latency
freshness
processing_delay
webhook_delivery_delay
```

Les objectifs doivent pouvoir différer selon environnement, produit, pays, client entreprise ou service public.

## 13. Error budgets

Chaque SLO important peut être associé à un budget d’erreur.

Lorsque le budget est consommé trop rapidement :

- les déploiements risqués peuvent être ralentis ;
- les travaux de fiabilité deviennent prioritaires ;
- les changements non essentiels peuvent être suspendus ;
- une analyse de tendance doit être lancée.

Le budget d’erreur ne remplace jamais les exigences de sécurité ou d’intégrité financière.

## 14. Health checks

Chaque service doit distinguer au minimum :

```text
liveness
readiness
startup
```

Un service vivant mais incapable de traiter correctement des transactions ne doit pas être considéré prêt.

Les dépendances critiques doivent être testées avec prudence afin d’éviter des cascades de redémarrages.

## 15. Alerting

Les alertes doivent privilégier les symptômes réellement impactants plutôt que le bruit technique.

Niveaux recommandés :

```text
SEV1 — interruption critique / risque financier ou sécurité majeur
SEV2 — dégradation importante d’un service critique
SEV3 — dégradation limitée ou contournable
SEV4 — anomalie faible / action planifiable
```

Une alerte doit contenir au minimum :

- service concerné ;
- environnement ;
- impact estimé ;
- heure de début ;
- métrique ou condition ;
- liens vers dashboards ;
- runbook ;
- dernier déploiement pertinent si disponible.

## 16. Réduction du bruit

Le système doit permettre :

- déduplication ;
- groupement ;
- temporisation courte ;
- suppression des doublons dépendants ;
- fenêtres de maintenance ;
- escalade progressive.

Une même panne partenaire ne doit pas générer des centaines d’alertes indépendantes.

## 17. Dashboards

Dashboards minimaux :

```text
Executive health
Platform overview
Payments
Ledger
Cards
Mobile Money
Agents
KYC/KYB
Notifications
APIs & webhooks
Databases
Queues & workers
Infrastructure
Security signals
Country / tenant health
Public sector
Tolling & mobility
```

Les dashboards doivent afficher clairement environnement, plage temporelle, unités et fraîcheur des données.

## 18. Observabilité multi-tenant

Les métriques et diagnostics doivent pouvoir être filtrés par tenant ou organisation sans exposer les données d’un tenant à un autre.

Les utilisateurs clients n’accèdent qu’aux informations prévues par leur rôle et leur contrat.

Les dashboards internes globaux restent soumis au RBAC et à l’audit.

## 19. Observabilité pays et région

Pour une expansion multi-pays, les incidents doivent être distinguables par :

```text
country
currency
regulatory_region
partner
telecom_operator
banking_partner
```

Une panne locale au Mali ne doit pas faire apparaître toute la plateforme africaine comme indisponible.

## 20. Péages et domaine État

Les décisions de référence du domaine péage restent obligatoires.

Deux solutions initiales coexistent :

- A : péage automatique classique avec barrière ;
- B : télépéage RFID UHF avec barrière.

Une évolution optionnelle ultérieure vers le free-flow sans barrière peut être ajoutée sans remplacer A ou B.

Le péage classique peut accepter selon configuration : billets et pièces FCFA, carte bancaire EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money.

Mobile Money est activable ou désactivable par l’administration au niveau national, réseau, poste ou voie, avec date d’effet, auteur et audit. Il ne doit jamais être supprimé automatiquement.

Le télépéage initial utilise des tags UHF RFID passifs associés au véhicule et au compte, avec lecteur/antenne, contrôleur local, relais `OPEN`, barrière et capteurs de passage.

La supervision péage doit mesurer au minimum :

```text
lane_online_status
barrier_open_success_rate
rfid_read_success_rate
anpr_match_rate
vehicle_detection_rate
payment_to_passage_latency
manual_barrier_open_count
offline_queue_depth
sync_delay
cash_device_status
cash_change_availability
```

Le fonctionnement local/hors ligne doit rester sécurisé, resynchronisable, idempotent et sans double débit.

Le terminal carte accepte les réseaux activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles, sans garantir toutes les cartes du monde.

Le matériel reste multi-fournisseurs derrière des adaptateurs, avec relais/contact sec ou interface industrielle documentée lorsque nécessaire.

Trois niveaux d’équipement doivent rester possibles : voie automatique complète, voie semi-automatique avec gestion sécurisée des espèces, et poste numérisé à faible coût.

Le déploiement est progressif ; l’État ne doit pas être obligé d’équiper tous les péages immédiatement.

Deux modèles commerciaux sont supportés : matériel acheté directement par l’État/concessionnaire ou matériel fourni, intégré ou revendu par Mansa.

La marque blanche doit couvrir bornes, tags, écrans, reçus et signalétique. La mention `Propulsé par Mansa` reste facultative.

Pour l’anti-corruption, l’observabilité doit rapprocher véhicule détecté, catégorie, tarif attendu, paiement, ouverture de barrière et passage physique. Toute ouverture manuelle de barrière doit rester auditée et faire l’objet de métriques/anomalies exploitables.

## 21. Mode hors ligne

Les composants pouvant fonctionner hors ligne doivent produire des événements localement avec :

- horodatage fiable ou indicateur d’horloge dégradée ;
- identifiant de dispositif ;
- séquence locale ;
- mécanisme anti-altération adapté ;
- statut de synchronisation.

Après reconnexion, la plateforme doit mesurer retard, volume resynchronisé, doublons rejetés et divergences éventuelles.

## 22. Déploiements et releases

Chaque métrique, log et trace doit pouvoir être corrélé à une version applicative.

Les dashboards doivent afficher les marqueurs de déploiement.

Après release, le système doit permettre de comparer :

```text
error rate avant/après
latency avant/après
conversion avant/après
payment success avant/après
resource usage avant/après
```

Les rollouts progressifs et feature flags doivent être observables par cohorte.

## 23. Gestion des incidents

Cycle recommandé :

1. détection ;
2. qualification ;
3. nomination d’un incident commander pour les incidents majeurs ;
4. limitation de l’impact ;
5. diagnostic ;
6. correction ou rollback ;
7. surveillance du rétablissement ;
8. clôture ;
9. postmortem si requis.

Les rôles doivent être clairs : coordination, technique, communication et liaison métier/réglementaire.

## 24. Runbooks

Chaque alerte critique doit pointer vers un runbook opérationnel.

Le runbook indique :

- symptômes ;
- vérifications ;
- commandes ou dashboards autorisés ;
- actions sûres ;
- actions nécessitant approbation ;
- rollback ;
- contacts/escalade ;
- critères de résolution.

Aucun runbook ne doit contenir de secret en clair.

## 25. Postmortems

Les incidents importants doivent faire l’objet d’un postmortem non accusatoire comprenant :

```text
impact
timeline
detection
root causes
contributing factors
what worked
what failed
action items
owners
due dates
```

Les actions doivent être suivies jusqu’à clôture.

## 26. Sécurité et accès

Les outils d’observabilité peuvent contenir des données opérationnelles sensibles.

Ils doivent appliquer :

- SSO/MFA lorsque disponible ;
- RBAC ;
- moindre privilège ;
- audit des accès ;
- séparation production/non-production ;
- conservation adaptée ;
- restrictions d’export.

## 27. Conservation

Les durées de conservation diffèrent selon le signal et les exigences légales.

Les politiques doivent distinguer :

```text
logs techniques
logs de sécurité
audit métier
métriques haute résolution
métriques agrégées
traces
incidents
```

La conservation doit être configurable par pays et type de donnée lorsque nécessaire.

## 28. Coûts

L’observabilité doit être budgétée et optimisée sans supprimer les signaux critiques.

Techniques possibles :

- sampling de traces ;
- agrégation métrique ;
- niveaux de logs ;
- rétention différenciée ;
- filtrage avant ingestion ;
- quotas par environnement ;
- détection de cardinalité excessive.

Les transactions financières, événements de sécurité et audits critiques ne doivent pas être perdus uniquement pour réduire le coût.

## 29. Environnements

Les environnements doivent être clairement séparés :

```text
dev
test
recette/staging
production
```

Aucun dashboard ou alerte ne doit permettre de confondre staging et production.

## 30. Tests d’observabilité

Les tests doivent vérifier :

- propagation des trace IDs ;
- absence de secrets dans les logs ;
- émission des métriques essentielles ;
- déclenchement des alertes critiques ;
- qualité des health checks ;
- dashboards après déploiement ;
- comportement des collecteurs en panne ;
- absence d’impact excessif de l’instrumentation sur les performances.

## 31. Critères de recette

Le domaine est considéré prêt lorsque :

- les services critiques sont instrumentés ;
- les principaux parcours métier disposent de métriques ;
- les paiements et le ledger sont corrélables de bout en bout ;
- les données sensibles sont redacted ;
- les alertes prioritaires disposent de runbooks ;
- les SLO critiques sont définis et mesurés ;
- les incidents peuvent être reconstruits chronologiquement ;
- les dashboards distinguent pays, tenant, canal et partenaire ;
- les modes hors ligne remontent correctement leurs états de synchronisation ;
- les péages exposent les métriques de voie, RFID, ANPR, barrière, espèces, paiement et passage physique nécessaires ;
- l’anti-corruption conserve la corrélation entre véhicule, tarif, paiement, ouverture et passage ;
- aucun secret n’est stocké dans la configuration ou les exemples du document.
