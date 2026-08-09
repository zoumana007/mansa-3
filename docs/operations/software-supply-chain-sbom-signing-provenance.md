# Opérations — Chaîne d’approvisionnement logicielle, SBOM, signature et provenance

## 1. Objet

Ce document définit le cadre Mansa de sécurisation de la chaîne d’approvisionnement logicielle, depuis le code source jusqu’aux artefacts déployés en production.

L’objectif est de garantir qu’un binaire, une image conteneur, un bundle mobile, une migration, un package ou un artefact d’infrastructure puisse être relié de manière traçable à :

- un dépôt Git autorisé ;
- un commit précis ;
- une branche ou un tag approuvé ;
- une pipeline CI/CD identifiée ;
- des dépendances connues ;
- une SBOM générée ;
- des contrôles de sécurité exécutés ;
- une signature ou attestation de provenance ;
- une décision de publication auditable.

Ce cadre complète les politiques existantes de sécurité, de gestion des secrets, de PCI DSS, d’observabilité, de PRA/PCA et de gestion des terminaux.

## 2. Principes directeurs

La chaîne logicielle Mansa suit les principes suivants :

1. aucun artefact de production ne doit être construit manuellement sur un poste développeur puis copié en production ;
2. les builds de production sont produits par une pipeline contrôlée ;
3. les dépendances sont verrouillées et vérifiées ;
4. chaque artefact publié possède une identité technique unique ;
5. chaque version importante génère une SBOM ;
6. les artefacts critiques sont signés ou accompagnés d’une attestation de provenance ;
7. les secrets de signature ne sont jamais stockés dans Git ;
8. les releases sont immuables après publication ;
9. tout rollback utilise un artefact déjà validé, pas un rebuild non contrôlé ;
10. les exceptions sont explicites, temporaires, justifiées et auditées.

## 3. Périmètre

Le dispositif s’applique notamment à :

- API et services backend ;
- applications web ;
- applications mobiles client, commerçant, agent et administration ;
- logiciels TPE ;
- logiciels de bornes et contrôleurs locaux ;
- services de téléphonie Jini Voice ;
- workers et traitements asynchrones ;
- images Docker/OCI ;
- scripts de migration ;
- packages internes ;
- IaC ;
- configurations de déploiement ;
- SDK publics et partenaires ;
- outils internes ayant accès à des données ou secrets sensibles.

## 4. Sources de confiance

Les sources de confiance doivent être explicitement définies.

Exemples :

```text
GitHub repositories autorisés
registries OCI autorisés
registry de packages autorisé
store mobile officiel
bucket de release signé
catalogue interne d’artefacts
```

Un artefact provenant d’une source inconnue ou non approuvée ne doit pas être déployé sur un environnement sensible.

## 5. Protection du code source

Les branches sensibles doivent supporter :

- revue obligatoire ;
- checks CI obligatoires ;
- interdiction de force-push selon politique ;
- historique traçable ;
- permissions minimales ;
- CODEOWNERS pour zones critiques ;
- protection renforcée pour les fichiers de sécurité, paiement, ledger, KYC, administration et infrastructure ;
- journalisation des changements de règles de branche.

Les merges directs vers une branche de production doivent être limités aux workflows autorisés.

## 6. Commits et identité

Pour les zones critiques, Mansa doit pouvoir conserver :

- SHA du commit ;
- auteur Git ;
- compte GitHub ayant réalisé le merge ;
- PR associée ;
- reviews ;
- résultats des checks ;
- date de merge ;
- tag/release ;
- identifiant de pipeline ;
- identifiant de l’artefact produit.

La signature des commits peut être activée lorsque l’organisation le juge nécessaire, mais elle ne remplace pas la signature des artefacts ni les contrôles CI.

## 7. Dépendances

Les dépendances doivent utiliser des versions verrouillées par lockfile lorsque l’écosystème le permet.

Règles :

- pas de dépendance flottante en production ;
- éviter les sources Git arbitraires non épinglées ;
- préférer les registries de confiance ;
- détecter packages abandonnés ou compromis ;
- contrôler les licences lorsque nécessaire ;
- identifier les dépendances transitives ;
- mettre à jour les dépendances avec revue et tests ;
- bloquer les vulnérabilités critiques non acceptées ;
- documenter les exceptions temporaires.

Snyk, audit de package manager, Dependabot et autres scanners peuvent contribuer à ces contrôles sans devenir une source unique de vérité.

## 8. SBOM

Chaque release significative doit produire une Software Bill of Materials.

Formats recommandés :

```text
CycloneDX
SPDX
```

La SBOM doit inclure, lorsque possible :

- nom de l’application ;
- version ;
- commit source ;
- composants directs ;
- composants transitifs ;
- versions ;
- hashes ;
- licences ;
- fournisseurs ;
- dépendances entre composants ;
- date de génération ;
- outil ayant généré la SBOM.

## 9. Stockage de la SBOM

La SBOM doit être conservée avec la release ou dans un référentiel d’artefacts associé.

Elle ne doit pas contenir de secret.

Pour un même artefact, le système doit pouvoir retrouver rapidement :

```text
artifact digest
→ release
→ commit
→ SBOM
→ scans
→ attestation
→ environnement déployé
```

## 10. Génération reproductible

Lorsque possible, le build doit tendre vers un résultat reproductible.

Le pipeline doit contrôler :

- version du runtime ;
- version du package manager ;
- lockfile ;
- outils de compilation ;
- images de base ;
- variables de build non secrètes ;
- horodatages non déterministes lorsque leur suppression est réaliste.

Un rebuild à partir du même commit ne doit pas silencieusement récupérer des dépendances différentes.

## 11. Images conteneur

Toute image OCI de production doit être référencée par digest et non uniquement par tag mutable.

Exemple :

```text
registry.example/mansa/api@sha256:...
```

Les tags comme `latest` ne sont pas une identité suffisante pour un déploiement sensible.

Les images doivent être analysées pour :

- vulnérabilités OS ;
- vulnérabilités applicatives ;
- packages inutiles ;
- utilisateur root ;
- permissions excessives ;
- secrets intégrés ;
- images de base obsolètes.

## 12. Signature des artefacts

Les artefacts critiques doivent pouvoir être signés.

Selon le type d’artefact :

- images OCI : signature associée au digest ;
- packages : signature/attestation ;
- applications mobiles : mécanismes officiels iOS/Android ;
- firmware ou logiciel de borne/TPE : signature du package de mise à jour ;
- binaires internes : signature adaptée à la plateforme.

La validation de signature doit intervenir avant installation ou déploiement lorsque techniquement possible.

## 13. Gestion des clés de signature

Les clés privées de signature sont des secrets critiques.

Elles doivent être protégées par :

- KMS ou HSM lorsque pertinent ;
- permissions minimales ;
- séparation des rôles ;
- rotation ;
- audit ;
- révocation ;
- sauvegarde contrôlée si nécessaire.

Une clé de signature de production ne doit jamais être copiée dans le dépôt, une image Docker, un fichier `.env` versionné ou un laptop personnel.

## 14. Provenance

Chaque artefact de production doit pouvoir posséder une attestation de provenance décrivant au minimum :

- dépôt source ;
- commit ;
- workflow ayant construit l’artefact ;
- date ;
- identité du builder ;
- digest de l’artefact ;
- paramètres de build pertinents ;
- environnement de build ;
- résultats de contrôles requis.

Une approche compatible SLSA peut être utilisée pour structurer progressivement ce niveau de confiance.

## 15. Séparation build / release / deploy

Mansa doit distinguer :

```text
BUILD
RELEASE
DEPLOY
```

`BUILD` produit un artefact.

`RELEASE` approuve cet artefact comme version distribuable.

`DEPLOY` installe exactement cet artefact dans un environnement.

Le passage d’un environnement à l’autre doit promouvoir le même digest lorsque possible au lieu de reconstruire le logiciel.

## 16. Environnements

Les environnements minimaux sont :

```text
DEVELOPMENT
TEST
STAGING
PRODUCTION
```

Des environnements `DEMO`, `PILOT`, `RECETTE`, `DR` ou `SANDBOX` peuvent être ajoutés.

Une release promotionnée vers production doit conserver la même identité d’artefact que celle testée en staging, sauf exception documentée.

## 17. Gates de sécurité

Les gates minimales peuvent inclure :

- tests unitaires ;
- tests d’intégration ;
- typecheck ;
- lint ;
- Semgrep ;
- Snyk ;
- GitGuardian ;
- audit dépendances ;
- scan conteneur ;
- validation IaC ;
- génération SBOM ;
- signature/attestation ;
- tests d’autorisation ;
- revue humaine sur modules critiques ;
- OWASP ZAP sur staging lorsque applicable.

Aucun agent IA ne doit supprimer un gate uniquement pour faire passer une release.

## 18. Classification des artefacts

Chaque artefact peut être classé :

```text
STANDARD
SENSITIVE
CRITICAL
REGULATED
```

Exemples `CRITICAL` ou `REGULATED` :

- ledger ;
- moteur de paiement ;
- identité/authentification ;
- KYC/AML ;
- portail État ;
- administration privilégiée ;
- TPE ;
- logiciel de borne ;
- firmware de contrôleur ;
- cryptographie ;
- gestion de clés.

Les exigences de signature, revue et approbation peuvent être plus strictes selon la classe.

## 19. Release manifest

Chaque release doit pouvoir produire un manifeste :

```text
releaseId
version
commitSha
artifactDigests
sbomIds
securityScanIds
provenanceId
signatures
migrationIds
releaseApprovals
deploymentTargets
rollbackArtifact
```

Ce manifeste devient une pièce d’audit importante.

## 20. Migrations de base de données

Les migrations doivent être versionnées et rattachées à une release.

Règles :

- aucune modification manuelle non tracée du schéma de production ;
- validation de migration avant production ;
- compatibilité avec rollback ou stratégie forward-fix documentée ;
- sauvegarde lorsque le risque le justifie ;
- séparation entre migration destructive et déploiement applicatif lorsque nécessaire ;
- journalisation de l’exécution.

## 21. Releases mobiles

Les applications mobiles doivent conserver :

- version marketing ;
- build number ;
- commit ;
- signature officielle ;
- environnement API ciblé ;
- date de soumission ;
- store ;
- statut de publication ;
- mécanisme de rollback logique ou version minimale supportée.

Aucun secret backend ne doit être considéré comme protégé parce qu’il est intégré dans une application mobile.

## 22. TPE, bornes et contrôleurs locaux

Les mises à jour de TPE, borne et contrôleur local sont particulièrement sensibles.

Le système doit pouvoir vérifier avant installation :

- fabricant/type de terminal ;
- modèle ;
- version actuelle ;
- version cible ;
- compatibilité ;
- hash ;
- signature ;
- politique de déploiement ;
- fenêtre de maintenance ;
- rollback ;
- statut final.

Une mise à jour non signée ou non autorisée doit pouvoir être refusée.

## 23. Déploiement progressif

Les releases critiques doivent pouvoir utiliser :

```text
CANARY
PILOT
PHASED_ROLLOUT
BLUE_GREEN
STANDARD
```

Exemple : logiciel de borne déployé d’abord sur un site pilote, puis sur un sous-ensemble de voies, puis à l’échelle nationale.

Les métriques d’erreur, paiement, disponibilité et fraude doivent être observées avant généralisation.

## 24. Rollback

Le rollback doit pointer vers un artefact connu et déjà signé/validé.

Le processus enregistre :

- version retirée ;
- version restaurée ;
- motif ;
- auteur ;
- approbateur si nécessaire ;
- heure ;
- environnements ;
- impact migrations ;
- contrôles post-rollback.

## 25. Révocation

Si une release, une signature, une clé ou un composant est compromis, Mansa doit pouvoir :

- marquer l’artefact révoqué ;
- bloquer de nouveaux déploiements ;
- identifier tous les environnements concernés ;
- identifier les appareils concernés ;
- déclencher rollback ou patch ;
- notifier les responsables ;
- ouvrir un incident sécurité ;
- conserver l’historique.

## 26. Inventaire des déploiements

Pour chaque environnement et appareil géré, Mansa doit pouvoir répondre à :

```text
Quelle version tourne ?
Quel digest ?
Quel commit ?
Quelle SBOM ?
Quelle signature ?
Quand a-t-elle été installée ?
Par quel pipeline ?
Est-elle encore autorisée ?
```

L’inventaire doit se connecter au module de gestion du parc de TPE, bornes et terminaux.

## 27. Vulnerability reachability

Lorsqu’une vulnérabilité est annoncée dans une dépendance, l’équipe doit pouvoir rechercher les releases dont la SBOM contient le composant concerné.

Workflow :

```text
CVE / composant vulnérable
→ recherche SBOM
→ artefacts concernés
→ environnements/appareils concernés
→ criticité métier
→ correctif
→ nouvelle release
→ suivi de déploiement
```

## 28. Packages internes

Les packages internes Mansa doivent :

- utiliser un namespace contrôlé ;
- être publiés dans un registry autorisé ;
- éviter les collisions de noms publiques ;
- avoir des permissions minimales ;
- conserver version, commit et provenance ;
- ne pas embarquer de secret ;
- être supprimés ou dépréciés de manière contrôlée.

Ce point réduit notamment le risque de dependency confusion.

## 29. Actions et runners CI

Les workflows CI/CD doivent limiter :

- permissions du token GitHub ;
- accès réseau ;
- secrets exposés ;
- actions tierces non épinglées ;
- runners persistants ;
- exécution de code non fiable avec secrets de production.

Les actions tierces sensibles doivent être épinglées par commit SHA lorsque possible.

## 30. Runners

Les builds sensibles peuvent utiliser des runners éphémères.

Après le job, l’environnement de build ne doit pas conserver :

- token de registry ;
- clé de signature ;
- credentials cloud ;
- données de test sensibles ;
- artefacts temporaires non nécessaires.

## 31. Tests et données

Les pipelines ne doivent pas utiliser de données personnelles de production sans procédure approuvée.

Les tests utilisent :

- données fictives ;
- datasets synthétiques ;
- données anonymisées si une nécessité réelle est documentée.

## 32. Artefacts de preuve

Les preuves suivantes doivent pouvoir être conservées selon la politique de rétention :

- logs de pipeline ;
- résultats tests ;
- rapports SAST/SCA ;
- SBOM ;
- signatures ;
- attestations ;
- approbations ;
- manifeste de release ;
- preuves de déploiement ;
- rollback ;
- exceptions.

## 33. Accès aux registries

Les registries doivent appliquer :

- authentification ;
- permissions par rôle ;
- séparation lecture/écriture ;
- protection des repositories de production ;
- tags immuables lorsque possible ;
- conservation par digest ;
- journal d’audit ;
- politique de rétention.

## 34. Promotion d’artefact

Le processus recommandé est :

```text
commit
→ build
→ tests
→ scans
→ SBOM
→ signature / provenance
→ registry de staging
→ déploiement staging
→ tests runtime
→ approbation
→ promotion du même digest
→ production
```

## 35. Exceptions

Une exception doit contenir :

- contrôle non respecté ;
- raison ;
- impact ;
- risque ;
- mesure compensatoire ;
- propriétaire ;
- approbateur ;
- date d’expiration ;
- ticket de suivi.

Les exceptions permanentes ne doivent pas devenir la norme.

## 36. Portail opérations

Menus recommandés :

```text
Software Supply Chain
├── Releases
├── Artifacts
├── SBOM
├── Provenance
├── Signatures
├── Vulnerabilities
├── Deployments
├── Devices
├── Rollbacks
├── Revocations
├── Exceptions
└── Audit
```

## 37. Modèle de données minimal

Entités recommandées :

```text
SoftwareRelease
BuildRun
SoftwareArtifact
ArtifactDigest
SBOMDocument
SBOMComponent
SecurityScan
ProvenanceAttestation
ArtifactSignature
ReleaseApproval
Deployment
DeploymentTarget
RollbackEvent
ArtifactRevocation
SupplyChainException
AuditLog
```

## 38. Permissions

Permissions recommandées :

```text
supply_chain.read
supply_chain.build.inspect
supply_chain.release.create
supply_chain.release.approve
supply_chain.deploy
supply_chain.rollback
supply_chain.revoke
supply_chain.exception.create
supply_chain.exception.approve
supply_chain.audit
```

Une même personne ne doit pas nécessairement pouvoir créer, approuver et déployer seule une release critique lorsque la séparation des tâches est activée.

## 39. Alertes

Alertes recommandées :

- artefact non signé tenté en production ;
- digest inconnu ;
- signature invalide ;
- SBOM manquante ;
- dépendance critique découverte ;
- package provenant d’une source non autorisée ;
- changement d’un tag immuable ;
- build lancé depuis une branche non approuvée ;
- clé de signature révoquée ;
- release révoquée encore en service ;
- écart entre version déclarée et version observée sur un terminal.

## 40. Intégration SOC/SIEM

Les événements sensibles de chaîne logicielle doivent alimenter le SOC/SIEM :

- publication ;
- signature ;
- échec de vérification ;
- déploiement ;
- rollback ;
- révocation ;
- changement de permissions ;
- usage de clé de signature ;
- exception de sécurité.

## 41. Résilience

Les registries, clés, attestations et manifests nécessaires à un PRA doivent être sauvegardés ou répliqués selon le niveau de criticité.

Le PRA doit permettre de reconstruire l’état d’un environnement à partir d’artefacts connus, sans dépendre d’un poste développeur individuel.

## 42. Exigences pour le domaine État et péages

Le présent module ne modifie aucune décision fonctionnelle de péage. Les exigences de référence restent :

- coexistence du péage automatique classique avec barrière et du télépéage RFID UHF avec barrière ;
- possibilité future de free-flow sans supprimer les deux solutions initiales ;
- paiement classique configurable avec billets/pièces FCFA, EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money ;
- Mobile Money activable/désactivable avec date d’effet et audit ;
- télépéage par tag UHF RFID passif associé au véhicule et au compte ;
- contrôleur local, relais OPEN, barrière et capteurs ;
- fonctionnement hors ligne sécurisé et resynchronisation sans double débit ;
- matériel multi-fournisseurs derrière adaptateurs ;
- voie automatique complète, semi-automatique et poste numérisé à faible coût ;
- déploiement progressif ;
- achat matériel direct ou fourniture/intégration/revente par Mansa ;
- marque blanche État/concessionnaire ;
- rapprochement anti-corruption véhicule, catégorie, tarif, paiement, ouverture et passage.

Pour ces systèmes, les mises à jour logicielles du contrôleur de voie, de la borne ou du terminal doivent être signées, traçables et déployables progressivement.

## 43. Critères d’acceptation

Le module est considéré implémenté lorsque :

- chaque release critique possède un commit source identifiable ;
- chaque artefact possède un digest ;
- une SBOM est générée ;
- les scans obligatoires sont enregistrés ;
- la provenance peut être vérifiée ;
- les artefacts critiques sont signés selon politique ;
- un artefact non autorisé peut être bloqué ;
- les déploiements sont traçables par environnement/appareil ;
- un composant vulnérable peut être recherché via les SBOM ;
- rollback et révocation sont supportés ;
- les clés de signature ne sont pas stockées dans Git ;
- les événements critiques sont auditables.

## 44. Résultat attendu

Mansa doit disposer d’une chaîne logicielle où l’on ne demande pas seulement « le code est-il bon ? », mais aussi :

```text
D’où vient cet artefact ?
Qui l’a construit ?
Avec quelles dépendances ?
Quels contrôles a-t-il passés ?
Est-il signé ?
Est-il exactement celui testé ?
Où est-il déployé ?
Peut-on le révoquer rapidement ?
```

La réponse à ces questions doit être disponible de manière structurée, traçable et exploitable lors d’un incident, d’un audit ou d’une mise à jour de sécurité.
