# Cahier des charges — Sauvegarde, continuité d’activité et reprise après sinistre

## 1. Objet

Ce document définit les exigences Mansa relatives à la sauvegarde, à la continuité d’activité, à la haute disponibilité, à la reprise après incident majeur et à la restauration contrôlée des données et services.

L’objectif est d’assurer qu’une panne, une erreur humaine, une corruption de données, une défaillance fournisseur, une indisponibilité régionale, un incident de cybersécurité ou une catastrophe physique ne provoque ni perte incontrôlée de données financières, ni double traitement, ni reprise incohérente.

Le présent module couvre les services centraux, applications, bases de données, queues, caches, stockage objet, journaux, configurations, secrets, terminaux gérés, composants offline et intégrations partenaires.

## 2. Principes directeurs

Le système doit respecter les principes suivants :

1. aucune sauvegarde ne remplace la haute disponibilité ;
2. aucune réplication ne remplace une sauvegarde historique immuable ;
3. toute restauration doit être testée régulièrement ;
4. le ledger financier est traité comme une source critique nécessitant contrôles supplémentaires ;
5. une restauration ne doit jamais créer de double débit ou double crédit ;
6. les objectifs RPO/RTO doivent être définis par classe de service ;
7. les sauvegardes doivent être chiffrées, contrôlées et auditées ;
8. les secrets de production ne doivent pas être stockés en clair dans les sauvegardes ;
9. les procédures de reprise doivent pouvoir être exécutées sans dépendre d’une seule personne ;
10. toute reprise significative doit produire un journal d’audit et un rapport post-incident.

## 3. Définitions

```text
RPO = Recovery Point Objective
RTO = Recovery Time Objective
HA = High Availability
DR = Disaster Recovery
BCP = Business Continuity Plan
PITR = Point-in-Time Recovery
Backup = copie indépendante permettant restauration historique
Replica = copie synchronisée ou quasi synchronisée destinée à disponibilité
Failover = bascule vers une instance ou région de secours
Failback = retour contrôlé vers l’environnement primaire
```

## 4. Classes de criticité

Les composants sont classés au minimum :

```text
TIER_0_CRITICAL_FINANCIAL
TIER_1_CRITICAL_PLATFORM
TIER_2_IMPORTANT_OPERATIONAL
TIER_3_SUPPORTING
TIER_4_ARCHIVAL
```

Exemples :

### Tier 0

- ledger ;
- transactions financières ;
- soldes calculés ou matérialisés ;
- écritures de règlement ;
- idempotency keys financières ;
- séquences anti-double traitement ;
- événements critiques de paiement.

### Tier 1

- identité/authentification ;
- autorisation/RBAC ;
- wallets ;
- paiement ;
- transferts ;
- agents ;
- cartes ;
- KYC/KYB ;
- configuration critique ;
- services État sensibles.

### Tier 2

- notifications ;
- reporting ;
- fidélité ;
- annuaire ;
- analytics opérationnel ;
- gestion de parc d’appareils.

### Tier 3/4

- contenus marketing ;
- archives ;
- données dérivées reconstructibles ;
- caches non critiques.

## 5. Objectifs RPO et RTO

Chaque service doit posséder un objectif documenté.

Valeurs indicatives initiales :

```text
Tier 0 : RPO <= 5 minutes ; RTO <= 60 minutes
Tier 1 : RPO <= 15 minutes ; RTO <= 2 heures
Tier 2 : RPO <= 4 heures ; RTO <= 8 heures
Tier 3 : RPO <= 24 heures ; RTO <= 48 heures
Tier 4 : selon politique d’archive
```

Ces valeurs sont des objectifs d’architecture et doivent être ajustées selon coût, réglementation, contrats partenaires et capacité réelle du déploiement.

Aucune promesse commerciale ne doit être faite avant validation par test réel.

## 6. Catalogue des actifs à protéger

Le système doit maintenir un inventaire comprenant au minimum :

```text
Database
Schema
ObjectStorageBucket
MessageQueue
EventStream
Cache
ConfigurationStore
SecretsStore
CertificateAuthorityMaterial
InfrastructureDefinition
ContainerRegistry
ArtifactRegistry
AuditArchive
ApplicationRelease
DeviceConfiguration
OfflineSynchronizationState
```

Chaque actif doit indiquer propriétaire, criticité, région, tenant concerné, politique de sauvegarde, rétention, chiffrement et procédure de restauration.

## 7. Bases de données relationnelles

Pour PostgreSQL ou équivalent :

- sauvegardes complètes périodiques ;
- WAL/PITR ou mécanisme équivalent ;
- réplication de disponibilité lorsque nécessaire ;
- validation régulière de restaurabilité ;
- contrôles d’intégrité ;
- chiffrement au repos et en transit ;
- séparation entre comptes d’exploitation et comptes de sauvegarde.

La sauvegarde doit inclure schéma, données, migrations et métadonnées nécessaires à la restauration.

## 8. Sauvegarde du ledger financier

Le ledger exige des mesures renforcées.

Une restauration doit préserver :

- identifiants d’écriture ;
- ordre logique des événements ;
- références transactionnelles ;
- idempotency keys ;
- liens débit/crédit ;
- devise ;
- tenant ;
- horodatage métier ;
- audit.

Aucune restauration partielle du ledger ne doit être exécutée sans procédure de rapprochement.

Après restauration, les soldes doivent être recalculables ou vérifiables à partir des écritures sources.

## 9. Immutabilité financière

Les écritures validées ne doivent pas être corrigées par suppression lors d’une reprise.

Une correction financière doit utiliser des écritures compensatoires ou mécanismes métier prévus.

Une restauration technique ne doit pas transformer une erreur comptable en modification silencieuse de l’historique.

## 10. Protection contre double traitement après reprise

Après un failover ou une restauration :

- les idempotency keys doivent être restaurées ;
- les messages déjà consommés doivent être identifiables ;
- les offsets de streams doivent être cohérents ;
- les webhooks entrants doivent être rejouables sans double effet ;
- les tâches planifiées doivent éviter la double exécution ;
- les paiements en état incertain doivent être rapprochés avant finalisation.

## 11. Sauvegarde des files et événements

Pour queues et event streams :

- conserver la durabilité adaptée au niveau critique ;
- documenter la stratégie de replay ;
- protéger les offsets ou checkpoints ;
- définir une dead-letter queue ;
- prévoir reconstruction des projections dérivées ;
- distinguer événements sources et événements reconstruisibles.

## 12. Caches

Redis ou cache équivalent n’est pas automatiquement une source de vérité.

Chaque usage doit préciser :

```text
CACHE_ONLY
SESSION_CRITICAL
QUEUE_BACKING
RATE_LIMIT_STATE
LOCK_STATE
DERIVED_DATA
```

Les données reconstructibles ne nécessitent pas le même niveau de sauvegarde que les sessions ou locks critiques.

## 13. Sessions et authentification

Une reprise doit traiter explicitement :

- sessions actives ;
- refresh tokens ;
- révocations ;
- MFA challenges ;
- appareils de confiance ;
- listes de blocage.

En cas de doute après incident de sécurité, le système doit pouvoir invalider massivement des sessions sans supprimer les comptes utilisateurs.

## 14. Stockage objet

Les documents KYC, reçus, preuves et archives doivent utiliser :

- versioning lorsque pertinent ;
- chiffrement ;
- réplication ou copie indépendante ;
- politiques de rétention ;
- contrôle d’accès strict ;
- protection contre suppression accidentelle ou malveillante.

Les objets soumis à obligation de conservation doivent utiliser une politique compatible avec les exigences légales applicables.

## 15. Backups immuables

Les sauvegardes critiques doivent pouvoir être protégées par une forme d’immutabilité ou de verrouillage empêchant une suppression immédiate par un compte compromis.

Exemples :

```text
Object Lock
WORM
Vault Lock
compte de sauvegarde séparé
rétention minimale forcée
```

L’immutabilité ne doit pas empêcher les politiques légales de suppression lorsque celles-ci s’appliquent ; la gouvernance doit distinguer données financières obligatoirement conservées et données personnelles supprimables.

## 16. Séparation des comptes et environnements

Les sauvegardes de production doivent être séparées autant que possible :

- du compte applicatif principal ;
- des droits développeurs ordinaires ;
- de l’environnement de test ;
- des sauvegardes d’autres tenants lorsque l’isolation l’exige.

Une compromission d’un compte applicatif ne doit pas permettre automatiquement de supprimer toutes les sauvegardes.

## 17. Chiffrement

Toutes les sauvegardes sensibles doivent être chiffrées au repos et en transit.

Les clés de chiffrement doivent être gérées via KMS/HSM ou mécanisme adapté.

La procédure DR doit inclure la capacité à restaurer l’accès aux clés sans les exposer dans un document ou dépôt Git.

## 18. Gestion des secrets

Les secrets ne doivent pas être exportés en clair dans des archives généralistes.

Le gestionnaire de secrets doit disposer d’une procédure indépendante de reprise incluant :

- rotation ;
- restauration des références ;
- récupération contrôlée ;
- révocation après compromission ;
- double contrôle pour secrets critiques.

## 19. Certificats et PKI

Les certificats publics peuvent être recréés, mais les éléments de confiance doivent être gérés explicitement.

La reprise doit couvrir :

- certificats services ;
- mTLS appareils ;
- clés de signature ;
- chaînes de certification ;
- listes de révocation ;
- rotation après incident.

Une clé privée compromise ne doit pas être restaurée comme si elle était saine.

## 20. Infrastructure as Code

L’infrastructure doit être reconstructible depuis une source versionnée.

Les éléments suivants doivent être conservés :

- Terraform/Pulumi/équivalent ;
- manifests Kubernetes ;
- configurations réseau ;
- policies IAM ;
- règles de firewall ;
- paramètres non secrets ;
- définitions de monitoring ;
- pipelines CI/CD.

Les secrets restent hors Git.

## 21. Images et artefacts applicatifs

Les releases validées doivent être reproductibles ou conservées dans un registry protégé.

Chaque déploiement doit être associé à :

```text
version
commit SHA
image digest
migration version
configuration version
release date
rollback compatibility
```

## 22. Multi-région

Les services critiques doivent pouvoir évoluer vers une architecture multi-zone ou multi-région selon la maturité.

Modes possibles :

```text
ACTIVE_PASSIVE
WARM_STANDBY
PILOT_LIGHT
ACTIVE_ACTIVE lorsque réellement supporté
```

Le mode choisi doit être cohérent avec la base de données, le ledger et les contraintes de cohérence.

## 23. Bascule automatique ou manuelle

Le failover peut être :

- automatique pour composants stateless ;
- semi-automatique pour services critiques ;
- manuel contrôlé pour bases financières lorsque le risque de split-brain est important.

La vitesse de bascule ne doit jamais primer sur l’intégrité financière.

## 24. Prévention du split-brain

Le système doit empêcher deux primaires financiers indépendants d’accepter simultanément des écritures contradictoires.

Mécanismes possibles :

- consensus ;
- fencing ;
- lease unique ;
- promotion contrôlée ;
- verrou de région primaire ;
- isolation réseau vérifiée.

## 25. Défaillance complète d’une région

Le runbook doit inclure :

1. déclaration d’incident majeur ;
2. confirmation de l’indisponibilité ;
3. gel des changements ;
4. identification du dernier point cohérent ;
5. promotion de la région secondaire ;
6. validation DB/ledger ;
7. validation identité et secrets ;
8. activation progressive des API ;
9. rapprochement partenaires ;
10. surveillance renforcée ;
11. communication interne/externe ;
12. préparation du failback.

## 26. Restauration ponctuelle PITR

Le PITR doit être utilisé pour restaurer une base à un instant avant corruption ou erreur humaine.

Avant toute restauration production :

- identifier précisément l’instant cible ;
- restaurer d’abord dans un environnement isolé ;
- vérifier intégrité ;
- comparer avec sources partenaires ;
- déterminer les transactions postérieures à réinjecter ou rapprocher.

## 27. Suppression accidentelle

En cas de suppression de données :

- suspendre les jobs susceptibles d’aggraver la perte ;
- préserver les preuves ;
- identifier la portée ;
- restaurer dans un espace isolé ;
- comparer ;
- réinjecter uniquement selon procédure approuvée.

## 28. Corruption logique

Une base répliquée peut répliquer une corruption.

Les sauvegardes historiques doivent donc permettre de revenir avant l’événement de corruption.

Le monitoring doit chercher :

- anomalies de volume ;
- suppressions massives ;
- changements de schéma inattendus ;
- incohérences de ledger ;
- erreurs de checksum ou intégrité.

## 29. Ransomware ou compromission

En cas d’incident cyber :

- ne pas restaurer automatiquement les mêmes credentials compromis ;
- reconstruire l’environnement de confiance ;
- analyser la période de compromission ;
- vérifier les sauvegardes avant restauration ;
- effectuer rotation des clés et secrets ;
- isoler les systèmes contaminés.

## 30. Continuité des paiements

Lorsqu’une partie de la plateforme est indisponible, les canaux doivent suivre une politique explicite.

Exemples :

```text
ONLINE_ONLY
LIMITED_OFFLINE
QUEUE_AND_SYNC
DECLINE_WHEN_UNCERTAIN
MANUAL_FALLBACK
```

Les opérations financières offline ne doivent être autorisées que si les contrôles de risque et plafonds le permettent.

## 31. Terminaux et fonctionnement offline

Les TPE, terminaux agents, tablettes État et bornes peuvent conserver un journal local protégé pour les opérations permises offline.

Au retour du réseau :

- authentification de l’appareil ;
- upload signé ou protégé ;
- déduplication ;
- idempotence ;
- ordre logique ;
- rapprochement ;
- traitement des conflits ;
- audit.

## 32. Exigences spécifiques péages

Le domaine péage doit préserver les décisions de référence suivantes :

- deux solutions coexistent : péage automatique classique avec barrière et télépéage RFID UHF avec barrière ;
- une évolution free-flow sans barrière reste optionnelle et future ;
- le péage classique peut accepter billets/pièces FCFA, carte EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money selon activation ;
- Mobile Money reste configurable par administration au niveau national, réseau, poste ou voie, avec date d’effet et audit ;
- le télépéage utilise initialement tag UHF RFID passif, véhicule/compte associé, lecteur/antenne, contrôleur local, relais OPEN, barrière et capteurs ;
- le matériel reste multi-fournisseurs derrière adaptateurs ;
- trois niveaux d’équipement sont conservés : automatique complet, semi-automatique, poste numérisé faible coût ;
- déploiement progressif ;
- matériel acheté par État/concessionnaire ou fourni/intégré/revendu par Mansa ;
- marque blanche État/concessionnaire avec mention facultative `Propulsé par Mansa` ;
- anti-corruption par rapprochement véhicule, catégorie, tarif, paiement, ouverture et passage physique.

## 33. Reprise locale d’une voie de péage

Une voie doit pouvoir continuer selon sa politique locale si le backend central est indisponible.

Le contrôleur local peut conserver :

- tarifs actifs ;
- listes d’autorisation/blocklist minimales ;
- données d’abonnement nécessaires ;
- compteur de passages ;
- événements barrière ;
- transactions locales autorisées ;
- identifiants uniques d’événement ;
- configuration signée ou protégée.

## 34. Reprise après retour réseau au péage

La resynchronisation doit rapprocher :

```text
véhicule détecté
catégorie
prix attendu
moyen de paiement
transaction locale
ouverture barrière
passage physique
```

Aucun passage ne doit être facturé deux fois parce que le contrôleur a retransmis un événement déjà traité.

## 35. Panne du télépéage

Si le lecteur RFID est indisponible :

- la voie peut basculer vers paiement classique si matériel disponible ;
- la plaque ANPR seule ne doit pas autoriser un débit sans règle contractuelle explicite ;
- toute ouverture manuelle est auditée ;
- les événements doivent être conservés pour rapprochement.

## 36. Panne des espèces

Si le validateur, monnayeur ou rendu de monnaie est indisponible :

- le canal espèces peut être désactivé localement ;
- les autres moyens restent disponibles si opérationnels ;
- l’affichage informe l’usager avant insertion ;
- la configuration centrale est resynchronisée ensuite.

## 37. Services État

Pour les services publics :

- prévoir reprise progressive par organisme ;
- ne pas exposer les données d’un ministère à un autre sans autorisation ;
- conserver preuve des paiements administratifs ;
- assurer continuité des amendes, taxes, bourses et autres flux selon criticité ;
- conserver audit des actions d’agents et administrateurs.

## 38. Mobile Money en mode dégradé

Le statut des opérations Mobile Money doit être considéré incertain tant qu’un opérateur n’a pas confirmé la transaction.

Après reprise :

- interroger ou rapprocher l’opérateur ;
- traiter les webhooks rejoués de manière idempotente ;
- ne pas recréditer ou redébiter sans preuve ;
- isoler les transactions `UNKNOWN/PENDING_RECONCILIATION`.

## 39. Réseaux cartes

Après incident acquéreur :

- ne pas supposer qu’un timeout signifie refus ;
- conserver l’identifiant de tentative ;
- rapprocher auprès de l’acquéreur ;
- supporter les réseaux activés contractuellement, notamment Visa et Mastercard lorsqu’ils sont disponibles ;
- ne jamais prétendre accepter toutes les cartes du monde.

## 40. Sauvegarde des configurations

Les configurations critiques doivent être versionnées :

- feature flags ;
- tarifs ;
- commissions ;
- limites ;
- moyens de paiement ;
- rôles ;
- politiques appareil ;
- politique offline ;
- branding ;
- langues.

Une restauration doit permettre de retrouver la configuration applicable à une date donnée.

## 41. Sauvegarde des journaux d’audit

Les logs d’audit critiques doivent être exportés vers un stockage durable distinct.

Ils doivent être protégés contre modification ou suppression non autorisée.

Le système doit conserver :

- acteur ;
- action ;
- cible ;
- ancienne valeur ;
- nouvelle valeur ;
- date ;
- tenant ;
- contexte technique.

## 42. Rétention

La durée de rétention dépend du type de donnée.

Une matrice doit définir :

```text
data_class
backup_frequency
retention_hot
retention_archive
legal_hold
purge_policy
restoration_priority
```

La durée doit respecter les obligations légales et contractuelles applicables.

## 43. Droit à l’effacement et sauvegardes

Lorsqu’une donnée personnelle doit être supprimée, le système doit documenter le comportement des sauvegardes historiques.

Une sauvegarde restaurée ne doit pas réintroduire durablement des données précédemment supprimées sans mécanisme de purge/reconciliation post-restauration.

## 44. Tests de restauration

Les tests doivent être réguliers.

Minimum recommandé :

- restauration DB en environnement isolé ;
- vérification d’intégrité ;
- démarrage de l’application ;
- contrôle migrations ;
- contrôle ledger ;
- contrôle secrets/certificats ;
- simulation de replay de messages.

Une sauvegarde jamais restaurée ne doit pas être considérée comme fiable.

## 45. Exercices DR

Des exercices doivent simuler :

- panne de zone ;
- panne régionale ;
- perte DB primaire ;
- corruption logique ;
- suppression objet ;
- compromission credentials ;
- indisponibilité opérateur ;
- perte de connectivité terrain.

## 46. Fréquence des exercices

Fréquences indicatives :

```text
Tier 0/Tier 1 : exercice ciblé trimestriel
DR régional : semestriel ou annuel selon maturité
restauration backup : mensuelle automatisée si possible
runbook review : trimestrielle
```

## 47. Tests automatisés

Le pipeline ou les jobs d’exploitation doivent pouvoir vérifier :

- backup récent présent ;
- checksum valide ;
- âge maximum respecté ;
- réplication saine ;
- PITR disponible ;
- capacité de restauration ;
- alertes sur dérive.

## 48. Monitoring des sauvegardes

Métriques :

```text
backup_last_success
backup_duration
backup_size
backup_failure_count
replication_lag
restore_test_last_success
rpo_estimated
archive_age
immutable_copy_status
```

## 49. Alertes

Alertes critiques :

- échec consécutif de sauvegarde ;
- absence de backup au-delà du seuil ;
- réplication arrêtée ;
- PITR indisponible ;
- stockage sauvegarde presque plein ;
- suppression massive ;
- échec test de restauration.

## 50. Runbooks

Chaque scénario critique doit avoir un runbook versionné.

Exemples :

```text
DB_PRIMARY_LOST
REGION_UNAVAILABLE
LEDGER_CORRUPTION
OBJECT_STORAGE_DELETION
RANSOMWARE
PAYMENT_PROVIDER_OUTAGE
MOBILE_MONEY_RECONCILIATION
TOLL_BACKEND_OUTAGE
DEVICE_FLEET_CREDENTIAL_ROTATION
```

## 51. Autorisations de reprise

Les opérations sensibles doivent nécessiter permissions fortes.

Exemples :

- restaurer production ;
- promouvoir replica ;
- supprimer une sauvegarde protégée ;
- changer une politique de rétention ;
- restaurer un secret ;
- effectuer failback.

Selon criticité, double validation recommandée.

## 52. Séparation des tâches

Une seule personne ne doit pas pouvoir à la fois :

- modifier une sauvegarde ;
- supprimer les preuves ;
- valider seule une restauration critique ;
- altérer l’audit associé.

## 53. Communication de crise

Le plan doit définir :

- incident commander ;
- responsable technique ;
- sécurité ;
- conformité ;
- communication ;
- relation partenaires ;
- relation État/administrations si concerné.

## 54. Statuts d’incident

```text
DETECTED
INVESTIGATING
CONTAINED
RECOVERY_IN_PROGRESS
SERVICE_PARTIALLY_RESTORED
SERVICE_RESTORED
RECONCILIATION
CLOSED
```

## 55. Validation avant réouverture

Avant reprise complète :

- DB cohérente ;
- migrations validées ;
- ledger rapproché ;
- secrets/certificats valides ;
- queues sous contrôle ;
- dépendances critiques joignables ;
- monitoring actif ;
- absence de double primaire ;
- test transaction contrôlé.

## 56. Failback

Le retour vers l’environnement primaire doit être planifié.

Il doit inclure :

- synchronisation ;
- validation cohérence ;
- fenêtre de bascule ;
- prévention double écriture ;
- tests ;
- rollback du failback si nécessaire.

## 57. Rapprochement après incident

Après toute reprise affectant les paiements :

- comparer ledger Mansa ;
- acquéreurs ;
- banques ;
- Mobile Money ;
- partenaires État ;
- agents ;
- terminaux offline.

Les écarts doivent être suivis jusqu’à résolution.

## 58. Rapport post-incident

Le rapport doit inclure :

```text
impact
période
cause racine
RPO réel
RTO réel
données potentiellement perdues
transactions en anomalie
actions de reprise
actions correctives
responsables
échéances
```

## 59. Gouvernance

Le plan DR appartient à une responsabilité explicite et doit être révisé après :

- changement majeur d’architecture ;
- nouvelle région ;
- nouveau partenaire critique ;
- incident significatif ;
- nouveau produit financier ;
- changement réglementaire.

## 60. Critères d’acceptation

Le module est considéré prêt lorsque :

1. tous les actifs critiques sont inventoriés ;
2. chaque service possède criticité, RPO et RTO ;
3. les backups sont automatisés ;
4. une copie critique est protégée contre suppression immédiate ;
5. le ledger possède une procédure spécifique de restauration et rapprochement ;
6. les idempotency keys sont incluses dans la stratégie ;
7. une restauration complète a été exécutée avec succès ;
8. un exercice de panne majeure a été documenté ;
9. les terminaux offline peuvent se resynchroniser sans double traitement ;
10. les exigences péage et État restent compatibles avec le fonctionnement local sécurisé ;
11. les secrets et clés ne sont pas stockés en clair dans les backups ou Git ;
12. les résultats de tests sont audités.

## 61. Livrables techniques attendus

```text
backup-policy.yaml
retention-matrix.yaml
dr-service-catalog.yaml
runbooks/
restore-tests/
reconciliation-playbooks/
monitoring/backup-alerts.yaml
infrastructure/dr/
```

Les noms exacts peuvent évoluer selon la stack, mais les responsabilités doivent rester explicites.

## 62. Principe final

Mansa doit considérer la reprise après sinistre comme une capacité métier continue, et non comme une procédure théorique écrite une seule fois.

La priorité est : préserver l’intégrité financière, empêcher les doubles traitements, restaurer progressivement les services critiques, rapprocher les flux externes, conserver les preuves et permettre une reprise locale sécurisée des services terrain lorsque le réseau central est indisponible.
