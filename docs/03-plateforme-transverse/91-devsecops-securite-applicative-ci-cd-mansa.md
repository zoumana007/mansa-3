# 91 — DevSecOps, sécurité applicative et CI/CD Mansa

## 1. Objet

Ce document définit le cahier des charges transversal de sécurité du cycle de développement Mansa. Il complète les modules d’authentification, identité, RBAC, fraude, conformité, API partenaires, paiements et infrastructure sans les remplacer.

L’objectif est que tout code livré par un développeur humain, Codex ou un autre agent autorisé passe par des contrôles de sécurité indépendants, reproductibles et auditables avant mise en production.

La règle de base est :

`Développer → scanner → tester → corriger → rescanner → revoir → construire → tester en staging → déployer → surveiller`.

Aucun outil unique, aucune IA et aucune revue humaine ne doit être considéré comme une garantie absolue de sécurité.

## 2. Périmètre

Le dispositif couvre au minimum :

- monorepo Mansa ;
- applications mobiles ;
- applications web ;
- API Gateway et services backend ;
- base de données et migrations ;
- workers et tâches asynchrones ;
- TPE et terminaux ;
- intégrations partenaires ;
- modules État ;
- infrastructures et conteneurs ;
- dépendances open source ;
- secrets et certificats ;
- scripts de déploiement ;
- workflows GitHub Actions ;
- SDK et API publiques ;
- configurations de staging et production.

## 3. Principes obligatoires

1. Refus par défaut pour les accès sensibles.
2. Moindre privilège pour utilisateurs, services, CI et agents IA.
3. Aucun secret réel dans Git.
4. Séparation stricte entre développement, sandbox, test, staging et production.
5. Toute modification sensible doit être traçable.
6. Les contrôles de sécurité automatisés ne peuvent pas être neutralisés uniquement pour faire passer une CI.
7. Un finding critique bloque le merge et le déploiement tant qu’il n’est pas corrigé ou formellement traité selon une procédure exceptionnelle approuvée.
8. Un finding élevé bloque par défaut le merge ; toute exception doit être documentée, limitée dans le temps, attribuée à un responsable et revue.
9. Les tests négatifs d’autorisation sont obligatoires pour les ressources sensibles et multi-tenant.
10. Les opérations financières doivent être idempotentes, auditables et résistantes aux doubles traitements.

## 4. Rôle de Codex et des agents IA

Codex peut :

- écrire du code ;
- créer des tests ;
- lancer les outils de sécurité ;
- lire leurs rapports ;
- corriger les findings ;
- relancer les analyses ;
- préparer les changements de configuration ;
- proposer des correctifs ;
- vérifier les dépendances ;
- préparer une revue avant merge.

Codex ne doit pas être autorisé à :

- supprimer un test uniquement parce qu’il échoue ;
- ignorer silencieusement un finding critique ou élevé ;
- désactiver GitGuardian, Snyk, Semgrep, ZAP ou un contrôle équivalent pour contourner un blocage ;
- affaiblir une branch protection ;
- écrire un secret de production dans le dépôt ;
- modifier une politique de sécurité critique sans justification et traçabilité ;
- considérer sa propre revue comme la seule preuve de sécurité.

## 5. Chaîne de sécurité de référence

### 5.1 Pendant le développement

Ordre fonctionnel recommandé :

1. GitGuardian ou scanner de secrets équivalent ;
2. Snyk ou scanner de dépendances équivalent ;
3. Semgrep ou SAST équivalent ;
4. tests unitaires, intégration, migrations, politiques et autorisations ;
5. lint, format, typecheck et build local/CI.

Ces contrôles peuvent s’exécuter en parallèle dans la CI lorsque cela réduit le temps de feedback.

### 5.2 Avant merge et avant déploiement

Le changement doit passer :

- revue technique ;
- revue de sécurité adaptée au risque ;
- `/ultrareview` lorsqu’il est disponible dans l’environnement Codex utilisé par l’équipe ;
- SAST complet ;
- audit des dépendances ;
- tests d’autorisation ;
- tests d’idempotence pour les flux financiers ;
- build reproductible ;
- validation des migrations ;
- vérification de l’absence de secrets.

### 5.3 En staging

OWASP ZAP ou un DAST équivalent doit être utilisé contre un environnement staging autorisé pour les surfaces HTTP exposées.

Les scans agressifs ne doivent pas être lancés directement contre la production sans procédure formelle, fenêtre approuvée et mesures de sécurité.

## 6. GitGuardian et protection des secrets

Le scanner de secrets doit couvrir :

- commits ;
- pull requests ;
- historique Git lorsque nécessaire ;
- fichiers de configuration ;
- scripts ;
- documentation ;
- exemples ;
- logs éventuellement commités par erreur.

Sont interdits dans Git :

- mots de passe réels ;
- tokens d’accès ;
- clés API ;
- clés privées ;
- certificats privés ;
- credentials base de données ;
- secrets JWT ;
- secrets HMAC ;
- clés Mobile Money ;
- credentials acquéreur ;
- credentials carte ;
- credentials opérateur ;
- secrets partenaires ;
- secrets de chiffrement.

Les fichiers `.env.example` doivent contenir uniquement des valeurs fictives non valides.

Lorsqu’un secret réel est détecté dans Git, la correction ne consiste pas seulement à supprimer la chaîne du dernier commit. Le secret doit être considéré comme compromis et révoqué/rotaté selon sa nature.

## 7. Gestion des secrets

Les secrets doivent être fournis par :

- GitHub Actions Secrets pour les workflows appropriés ;
- gestionnaire de secrets cloud ou coffre sécurisé en environnement ;
- mécanisme de provisioning protégé pour appareils et TPE ;
- système de certificats lorsque nécessaire.

Chaque secret doit posséder :

- propriétaire ;
- usage ;
- environnement ;
- date de création ;
- rotation ;
- révocation ;
- permissions ;
- audit d’accès lorsque disponible.

Les secrets de staging et production sont distincts.

## 8. Snyk et sécurité des dépendances

Le scanner de dépendances doit analyser :

- packages Node/TypeScript ;
- packages mobiles ;
- images conteneur ;
- Dockerfiles ;
- IaC lorsque présent ;
- dépendances transitives ;
- licences selon politique ;
- manifests et lockfiles.

Le lockfile doit être versionné et les installations CI doivent être reproductibles.

Les vulnérabilités sont triées selon :

- sévérité ;
- exploitabilité ;
- exposition réelle ;
- disponibilité d’un correctif ;
- importance du composant ;
- contexte financier ;
- présence de données sensibles.

Une mise à jour de dépendance ne doit pas être appliquée aveuglément : elle passe par tests et build.

## 9. Dependabot et mises à jour automatisées

Dependabot ou un mécanisme équivalent peut proposer les mises à jour.

Les pull requests automatiques doivent quand même passer :

- tests ;
- SAST ;
- audit ;
- revue ;
- build.

Les actions GitHub utilisées dans les workflows doivent être épinglées à une version ou idéalement à un SHA validé pour limiter le risque supply-chain.

## 10. Semgrep et analyse statique

Semgrep doit analyser au minimum :

- injections ;
- contrôles d’accès ;
- validation d’entrée ;
- usages cryptographiques dangereux ;
- SSRF ;
- path traversal ;
- XSS ;
- erreurs de sérialisation ;
- exposition de données ;
- logique de sécurité contournable ;
- patterns TypeScript/NestJS dangereux ;
- erreurs liées aux secrets.

Le jeu de règles doit inclure des règles génériques OWASP et, progressivement, des règles Mansa personnalisées.

## 11. Règles Semgrep Mansa personnalisées

Des règles internes doivent progressivement détecter :

- endpoint financier sans politique d’autorisation ;
- route sensible déclarée publique ;
- accès direct à une ressource sans filtre tenant/organisation ;
- création de transaction sans idempotency key lorsque requise ;
- log d’un token ou secret ;
- stockage d’un PIN ou OTP en clair ;
- contournement d’un service de ledger ;
- modification directe d’un solde sans écriture comptable ;
- suppression physique d’un audit financier lorsque seule une rétention contrôlée est autorisée ;
- usage d’un algorithme cryptographique interdit par politique.

## 12. `/ultrareview`

Lorsque `/ultrareview` est disponible dans l’environnement de développement ou Codex, il doit servir de revue complémentaire avant merge pour les changements importants.

Il doit examiner notamment :

- erreurs logiques ;
- régressions ;
- autorisations ;
- concurrence ;
- double débit ;
- erreurs de transaction ;
- isolation multi-tenant ;
- exposition de données ;
- robustesse des erreurs ;
- qualité des tests.

Cette revue ne remplace ni Semgrep, ni Snyk, ni GitGuardian, ni les tests CI.

## 13. OWASP ZAP et DAST

ZAP est utilisé sur les applications web et API déployées dans un environnement contrôlé.

Il doit couvrir selon disponibilité :

- headers de sécurité ;
- cookies ;
- CORS ;
- erreurs HTTP ;
- XSS ;
- injections détectables dynamiquement ;
- mauvaises configurations ;
- endpoints accessibles sans autorisation ;
- contenu sensible exposé ;
- redirections ;
- sécurité TLS visible côté service.

Les comptes utilisés par ZAP sont des comptes de test et ne contiennent pas de données personnelles réelles.

## 14. CI GitHub Actions

Les workflows doivent au minimum inclure des jobs distincts ou clairement identifiables pour :

- install reproductible ;
- format ;
- lint ;
- typecheck ;
- tests ;
- migrations ;
- build ;
- audit dépendances ;
- SAST ;
- secret scanning ;
- tests de sécurité spécifiques lorsque disponibles.

Les permissions `GITHUB_TOKEN` doivent être minimales, typiquement `contents: read` pour les jobs n’ayant pas besoin d’écrire.

## 15. Protection des branches

Les branches critiques doivent progressivement imposer :

- pull request obligatoire ;
- checks CI obligatoires ;
- absence de conflit ;
- revue requise pour zones sensibles ;
- protection contre force-push selon politique ;
- protection contre suppression accidentelle ;
- CODEOWNERS pour sécurité, paiements, ledger, IAM, infrastructure et conformité lorsque l’équipe correspondante existe.

Un agent IA ne doit pas désactiver ces protections de sa propre initiative.

## 16. Pull requests

Toute PR importante doit décrire :

- objectif ;
- changements ;
- composants concernés ;
- risques ;
- tests exécutés ;
- migrations ;
- variables de configuration ;
- rollback ;
- impact sécurité ;
- impact multi-tenant ;
- impact financier ;
- nouvelles dépendances.

## 17. Authentification et sessions

Les contrôles automatiques doivent vérifier ou permettre de vérifier :

- durée de vie courte des access tokens ;
- validation issuer/audience ;
- sessions révocables ;
- refresh tokens protégés ;
- absence de secrets dans les claims ;
- vérification du statut utilisateur ;
- vérification du statut de session ;
- MFA/step-up pour opérations sensibles selon politique.

## 18. Autorisation et RBAC

Les endpoints non publics doivent posséder une politique explicite.

Le comportement recommandé est `deny by default` : une route sensible sans permission déclarée est refusée plutôt qu’autorisée implicitement.

Les tests doivent inclure :

- utilisateur sans rôle ;
- rôle insuffisant ;
- ressource d’un autre utilisateur ;
- ressource d’un autre commerçant ;
- ressource d’un autre tenant ;
- compte suspendu ;
- session révoquée ;
- permission expirée ;
- rôle révoqué.

## 19. Isolation multi-tenant

Pour chaque domaine multi-tenant, les requêtes doivent filtrer par tenant/organisation/contexte serveur autorisé.

Les tests négatifs doivent tenter explicitement :

- changement d’identifiant dans URL ;
- changement d’identifiant dans body ;
- changement de tenant dans header ;
- accès via recherche ;
- accès via export ;
- accès via fichiers ;
- accès via webhook ;
- accès via reporting.

Une simple dissimulation côté interface ne constitue jamais une protection.

## 20. Validation des entrées

Les API doivent :

- valider type, longueur et format ;
- rejeter les champs non prévus lorsque pertinent ;
- normaliser les entrées ;
- limiter taille des payloads ;
- contrôler fichiers et MIME ;
- ne pas faire confiance aux valeurs venant du client pour permissions, prix, frais, soldes ou état d’une transaction.

## 21. Sécurité des paiements

Les opérations financières doivent inclure selon le flux :

- idempotency key ;
- identifiant transaction unique ;
- verrouillage ou contrôle de concurrence ;
- ledger en partie double ou modèle comptable défini ;
- séparation autorisation/capture lorsque nécessaire ;
- signature/vérification des callbacks ;
- prévention du replay ;
- audit ;
- rapprochement ;
- états terminaux explicites.

Un échec réseau ne doit jamais suffire à conclure qu’un paiement a échoué ou réussi sans vérification de l’état serveur/partenaire.

## 22. Tests de concurrence

Des tests doivent couvrir :

- deux retraits simultanés ;
- deux transferts concurrents ;
- double clic paiement ;
- callback partenaire répété ;
- retry réseau ;
- webhook dupliqué ;
- resynchronisation offline ;
- opération concurrente sur le même wallet ;
- remboursement concurrent.

Le résultat doit être déterministe et ne jamais produire un double débit ou double crédit involontaire.

## 23. Base de données et migrations

Chaque migration doit être :

- versionnée ;
- testable ;
- compatible avec le déploiement prévu ;
- revue pour pertes de données ;
- documentée lorsqu’elle modifie un domaine sensible ;
- accompagnée d’une stratégie rollback ou forward-fix.

Les scripts destructifs sont explicitement signalés et nécessitent une validation renforcée.

## 24. Données sensibles

La sécurité doit tenir compte de :

- données d’identité ;
- KYC/KYB ;
- données bancaires ;
- transactions ;
- localisation ;
- données gouvernementales ;
- données de cartes ;
- données d’appareil ;
- logs de sécurité.

Les logs ne doivent pas contenir de PIN, OTP, mot de passe, PAN complet, CVV, secret ou token réutilisable.

## 25. Chiffrement

Les données en transit utilisent TLS.

Les données sensibles au repos doivent bénéficier des mécanismes de chiffrement appropriés selon infrastructure et conformité.

Les clés cryptographiques sont gérées séparément des données et des dépôts Git.

Aucun algorithme cryptographique maison ne doit être inventé pour remplacer des standards éprouvés.

## 26. Headers et sécurité web

Les services web doivent utiliser des protections adaptées, par exemple via Helmet ou mécanisme équivalent, avec politique explicite pour :

- CSP lorsque applicable ;
- HSTS en production HTTPS ;
- protection MIME ;
- frame ancestors ;
- referrer policy ;
- cookies Secure/HttpOnly/SameSite lorsque utilisés.

Les valeurs doivent être testées avec les besoins réels des applications.

## 27. CORS

CORS ne doit pas être ouvert à `*` pour les flux authentifiés sensibles sans justification.

Les origines autorisées sont configurées par environnement.

Le backend ne doit pas considérer CORS comme une barrière d’autorisation.

## 28. Rate limiting et protection contre abus

Les API doivent prévoir :

- limites par IP ;
- limites par utilisateur ;
- limites par application ;
- limites par token ;
- limites par endpoint ;
- protections OTP ;
- protections login ;
- protections récupération ;
- protections création de paiement ;
- protections export/reporting.

Les limites peuvent être adaptatives selon risque.

## 29. Swagger/OpenAPI

La documentation OpenAPI est utile en développement, test et portail développeur.

En production, son exposition doit être décidée explicitement :

- publique uniquement pour les API réellement publiques ;
- protégée ou désactivée pour les API internes ;
- aucune donnée de secret ou exemple réel ne doit y apparaître.

## 30. Applications mobiles

La sécurité mobile doit inclure :

- stockage sécurisé des tokens ;
- aucune clé backend secrète embarquée ;
- biométrie via OS ;
- protection contre logs sensibles ;
- vérification des deep links ;
- validation des URLs ;
- mécanisme de session révoqué côté serveur ;
- gestion appareil compromis selon risque ;
- mises à jour de sécurité.

Le client mobile n’est jamais la source de vérité pour solde, permission, frais ou validation finale d’un paiement.

## 31. TPE et appareils de terrain

Les terminaux doivent utiliser :

- identité appareil ;
- provisioning contrôlé ;
- certificats/credentials distincts ;
- rotation/révocation ;
- chiffrement transport ;
- logs minimisés ;
- mode offline limité ;
- synchronisation idempotente ;
- attestation ou contrôle d’intégrité lorsque possible.

Un appareil volé doit pouvoir être révoqué sans bloquer tout le parc.

## 32. Dépendance au matériel

Les modules matériels restent multi-fournisseurs derrière des adaptateurs. Les contrôles de sécurité doivent s’appliquer aux SDK constructeurs, passerelles, drivers et protocoles industriels.

Pour les péages, les exigences métier de référence restent inchangées : péage automatique classique avec barrière et télépéage UHF RFID avec barrière coexistent, avec possibilité future de free-flow sans remplacer les deux solutions initiales. Les modes offline, l’audit des ouvertures manuelles, la compatibilité multi-fournisseurs et le rapprochement véhicule-paiement-barrière-passage restent obligatoires.

## 33. Sécurité des webhooks

Les webhooks entrants et sortants doivent prévoir :

- signature ;
- timestamp ;
- secret/certificat rotatif ;
- détection du replay ;
- idempotence ;
- retries bornés ;
- journal de livraison ;
- traitement asynchrone si nécessaire ;
- aucune confiance implicite dans l’IP seule.

## 34. Supply chain logicielle

Le pipeline doit surveiller :

- packages compromis ;
- typosquatting ;
- dépendances inutiles ;
- scripts d’installation ;
- GitHub Actions tierces ;
- images Docker ;
- provenance des artefacts lorsque disponible.

Les dépendances ajoutées doivent être justifiées et minimisées.

## 35. SBOM

Avant maturité production, Mansa doit pouvoir produire un SBOM par release ou artefact majeur comprenant :

- composants ;
- versions ;
- dépendances ;
- licences ;
- hashes/provenance lorsque disponible.

Le SBOM facilite réponse à incident et analyse de vulnérabilité.

## 36. Images conteneur

Les images doivent :

- partir d’images de base maintenues ;
- être minimales ;
- éviter l’exécution root lorsque possible ;
- ne contenir aucun secret ;
- être scannées ;
- être reconstruites lors de correctifs critiques ;
- être identifiées par digest/tag immuable dans les déploiements sensibles.

## 37. Infrastructure as Code

Lorsqu’une IaC est introduite, elle doit être scannée pour :

- ports publics inutiles ;
- permissions excessives ;
- stockage public ;
- chiffrement désactivé ;
- secrets ;
- règles réseau faibles ;
- rôles IAM excessifs.

## 38. Environnements

Les environnements sont séparés :

```text
LOCAL
DEVELOPMENT
SANDBOX
TEST
STAGING
PRODUCTION
```

Les données et secrets ne doivent pas être copiés de production vers développement sans anonymisation et autorisation.

## 39. Staging

Staging doit être suffisamment proche de production pour tester :

- migrations ;
- sécurité HTTP ;
- intégrations simulées ou certifiées ;
- rôles ;
- monitoring ;
- déploiements ;
- rollback ;
- ZAP/DAST.

Il utilise des données fictives ou anonymisées.

## 40. Production

L’accès production doit être limité et audité.

Les changements production passent par pipeline contrôlé. Les accès manuels d’urgence sont exceptionnels, temporaires et journalisés.

## 41. Observabilité de sécurité

Le système doit collecter des signaux sur :

- erreurs auth ;
- accès refusés ;
- élévations de privilège ;
- modifications de rôles ;
- création/révocation de clés ;
- échecs webhook ;
- anomalies financières ;
- erreurs répétées ;
- activité admin ;
- pannes de scanner CI ;
- changement de configuration critique.

## 42. Journaux

Les logs doivent :

- être structurés ;
- avoir un correlation/request ID ;
- limiter les données personnelles ;
- masquer secrets et tokens ;
- avoir une rétention configurable ;
- être protégés contre modification non autorisée ;
- permettre enquête et support.

## 43. Incidents de sécurité

Le processus doit prévoir :

```text
Détection
→ Qualification
→ Confinement
→ Révocation/rotation
→ Correction
→ Validation
→ Déploiement
→ Surveillance
→ Post-mortem
```

L’incident doit enregistrer :

- date ;
- système ;
- gravité ;
- données potentiellement affectées ;
- cause ;
- actions ;
- responsables ;
- preuve de correction ;
- actions préventives.

## 44. Vulnérabilité critique

Une vulnérabilité critique peut nécessiter :

- arrêt d’un déploiement ;
- désactivation contrôlée d’une fonctionnalité ;
- rotation immédiate de secret ;
- blocage d’un partenaire ;
- révocation de sessions ;
- correctif prioritaire ;
- enquête ;
- communication réglementaire selon obligations applicables.

## 45. Acceptation de risque

Une exception ne doit jamais être un simple commentaire `ignore`.

Elle doit contenir :

- finding ;
- sévérité ;
- justification ;
- exposition ;
- mesure compensatoire ;
- propriétaire ;
- date d’expiration ;
- approbateur ;
- ticket de suivi.

À expiration, le finding redevient bloquant s’il n’est pas corrigé.

## 46. Tests de sécurité par domaine

### Identité

- brute force ;
- session révoquée ;
- token expiré ;
- audience incorrecte ;
- refresh token rejoué ;
- step-up absent.

### Wallet/ledger

- double débit ;
- solde insuffisant ;
- concurrence ;
- rollback ;
- écriture non équilibrée ;
- accès inter-tenant.

### Paiements

- webhook falsifié ;
- callback répété ;
- montant manipulé ;
- devise manipulée ;
- idempotency key rejouée avec payload différent.

### Administration

- rôle insuffisant ;
- changement de commission non autorisé ;
- accès à un autre tenant ;
- export massif ;
- ouverture manuelle sans audit.

## 47. Modules État et péages

Les contrôles DevSecOps doivent tenir compte des exigences de référence :

- coexistence du péage automatique classique avec barrière et du télépéage RFID UHF avec barrière ;
- free-flow seulement comme évolution future optionnelle ;
- espèces XOF, EMV multi-réseaux selon acquéreur, NFC, carte Mansa, wallet Mansa, QR et Mobile Money configurables ;
- Mobile Money activable/désactivable aux niveaux national, réseau, poste ou voie avec date d’effet et audit ;
- mode local/hors ligne sécurisé sans double débit ;
- matériel multi-fournisseurs derrière adaptateurs ;
- trois niveaux d’équipement ;
- déploiement progressif ;
- matériel acheté par l’État/concessionnaire ou fourni/intégré/revendu par Mansa ;
- marque blanche ;
- anti-corruption par rapprochement véhicule, catégorie, tarif, paiement, ouverture et passage physique ;
- toute ouverture manuelle auditée.

Les tests doivent vérifier que les changements logiciels n’affaiblissent aucune de ces exigences.

## 48. Critères de blocage d’une release

Une release est bloquée si au moins une condition est vraie :

- secret réel détecté ;
- finding critique non traité ;
- finding élevé non accepté selon procédure ;
- build échoué ;
- tests critiques échoués ;
- migration invalide ;
- test d’autorisation sensible échoué ;
- risque de double débit identifié ;
- scanner requis indisponible sans décision explicite ;
- artefact non traçable.

## 49. Critères de validation

Une release candidate est considérée prête uniquement lorsque :

- CI verte ;
- GitGuardian vert ;
- Snyk/audit vert selon seuil ;
- Semgrep vert selon seuil ;
- revue complète terminée ;
- build réussi ;
- migrations validées ;
- tests sécurité du domaine réussis ;
- ZAP staging réalisé lorsque pertinent ;
- rollback documenté ;
- changelog/release notes disponibles.

## 50. Indicateurs

Le reporting sécurité peut inclure :

- nombre de findings critiques/élevés ;
- temps moyen de correction ;
- taux de PR passant les gates du premier coup ;
- vulnérabilités dépendances ouvertes ;
- secrets détectés ;
- dépendances obsolètes ;
- couverture des tests d’autorisation ;
- releases bloquées ;
- résultats ZAP ;
- incidents sécurité ;
- délai de rotation de secret compromis.

## 51. Évolution du dispositif

Les outils cités constituent la chaîne de référence actuelle mais l’architecture ne doit pas dépendre commercialement d’un seul fournisseur. GitGuardian, Snyk, Semgrep et OWASP ZAP peuvent être remplacés ou complétés par des solutions équivalentes si elles offrent au minimum les mêmes contrôles, preuves et capacités de blocage.

La politique Mansa est la source de vérité ; l’outil est un moyen d’application.

## 52. Résultat attendu

À terme, chaque changement Mansa doit disposer d’une chaîne de preuves :

`commit → PR → tests → secret scan → dependency scan → SAST → revue → build → staging/DAST → approbation → artefact → déploiement → observabilité`.

Cette chaîne doit permettre à Mansa de développer rapidement avec Codex et l’automatisation tout en conservant des contrôles indépendants adaptés à une plateforme fintech, multi-tenant, multi-pays et intégrée à des services publics et matériels physiques.
