# Sécurité Mansa — Protection API, rate limiting, WAF, anti-abus et DDoS

## 1. Objet

Ce document définit les exigences de sécurité en périphérie de la plateforme Mansa pour protéger les API, portails web, webhooks, services publics, interfaces partenaires et flux machine-à-machine contre :

- abus automatisés ;
- brute force ;
- credential stuffing ;
- scraping agressif ;
- surcharge applicative ;
- attaques de couche 7 ;
- attaques volumétriques ;
- scans opportunistes ;
- injections et requêtes malformées ;
- tentatives de contournement de quotas ;
- saturation volontaire ou accidentelle ;
- exploitation abusive d’API coûteuses ;
- attaques distribuées par botnets.

Ce document complète l’authentification, le RBAC, la sécurité mobile, la gestion des secrets, le SOC/SIEM, l’observabilité et les politiques de sécurité existantes. Il ne remplace aucune de ces protections.

## 2. Principe de défense en profondeur

Aucun composant unique ne doit être considéré comme une protection suffisante.

Architecture logique recommandée :

```text
Internet / partenaire / terminal
→ protection réseau et anti-DDoS
→ CDN / edge lorsque pertinent
→ WAF
→ API Gateway / reverse proxy
→ rate limiting / quotas / anti-bot
→ authentification
→ autorisation / RBAC / ABAC
→ validation des entrées
→ services Mansa
→ base de données / systèmes partenaires
```

Chaque couche doit limiter l’impact d’un contournement éventuel de la couche précédente.

## 3. Périmètre

La politique s’applique notamment à :

- API publique Mansa ;
- API mobile client ;
- API commerçant ;
- API agents ;
- API TPE ;
- API bornes ;
- portail administrateur ;
- portail État ;
- portail entreprise ;
- portail développeur ;
- annuaire et marketplace ;
- Jini Voice et services IA exposés ;
- webhooks entrants ;
- webhooks sortants lorsque des mécanismes de retry existent ;
- intégrations bancaires ;
- Mobile Money ;
- partenaires cartes/acquéreurs ;
- API de télépéage et mobilité ;
- services d’authentification ;
- endpoints de récupération de compte ;
- endpoints KYC/KYB ;
- endpoints de paiement, transfert, retrait, dépôt et remboursement.

## 4. Aucune confiance implicite dans le réseau

Une requête provenant d’un réseau interne, d’un VPN, d’un site d’État, d’un TPE, d’une borne, d’un partenaire ou d’une IP connue ne doit pas être automatiquement considérée comme sûre.

Les décisions d’accès sensibles restent fondées sur :

- identité ;
- authentification ;
- rôle ;
- permissions ;
- tenant ;
- contexte ;
- appareil ;
- session ;
- niveau de risque ;
- politique métier applicable.

L’adresse IP est un signal, jamais l’unique preuve d’identité.

## 5. API Gateway

Les API exposées doivent être placées derrière une passerelle ou un reverse proxy contrôlé lorsque l’architecture le permet.

Responsabilités recommandées :

```text
TLS termination ou pass-through contrôlé
normalisation des headers
limitation de taille des requêtes
rate limiting
quotas
routage
journalisation
correlation ID
contrôle des méthodes HTTP
CORS
politiques de timeout
protection contre requêtes anormales
intégration WAF
```

La gateway ne doit pas contenir seule les règles métier sensibles : les services backend doivent aussi contrôler les autorisations.

## 6. Rate limiting multi-dimensionnel

Le rate limiting ne doit pas être uniquement basé sur l’IP.

Les dimensions possibles sont :

```text
IP
userId
sessionId
deviceId
merchantId
agentId
organizationId
tenantId
API key
clientId OAuth
partnerId
phoneNumber hashé lorsque pertinent
card token
endpoint
route group
country
ASN
risk bucket
```

Plusieurs dimensions peuvent être combinées.

Exemple :

```text
LOGIN = limite par IP + identifiant + appareil
PAYMENT_CREATE = limite par utilisateur + wallet + appareil
PUBLIC_API = limite par API key + organisation
WEBHOOK = limite par partenaire + signature + source
```

## 7. Algorithmes de limitation

Les implémentations peuvent utiliser selon le cas :

- token bucket ;
- leaky bucket ;
- sliding window ;
- fixed window avec protections contre les effets de bord ;
- quotas distribués centralisés ;
- limites locales de secours.

Le choix doit être documenté par catégorie d’endpoint.

## 8. Limites configurables

Les limites ne doivent pas être dispersées en valeurs codées en dur.

Elles doivent pouvoir être configurées par :

- environnement ;
- produit ;
- route ;
- tenant ;
- type de client ;
- niveau de risque ;
- contrat partenaire ;
- pays ;
- campagne ou période exceptionnelle.

Toute modification sensible doit être auditée.

## 9. Protection des endpoints d’authentification

Les routes suivantes exigent des protections renforcées :

- connexion ;
- OTP ;
- renvoi OTP ;
- changement de mot de passe ;
- récupération de compte ;
- activation d’appareil ;
- création de session ;
- refresh token ;
- changement de numéro ;
- ajout d’un facteur MFA.

Mesures minimales :

- limite par compte et par source ;
- délai progressif ;
- détection d’essais distribués ;
- protection anti-enumération ;
- alertes en cas de comportement anormal ;
- invalidation ou challenge renforcé selon risque.

## 10. Anti-enumération

Les réponses publiques ne doivent pas révéler inutilement :

- qu’un numéro existe ;
- qu’un email existe ;
- qu’un wallet existe ;
- qu’un commerçant sensible est enregistré ;
- qu’un identifiant administratif existe.

Les messages d’erreur doivent être suffisamment génériques lorsque l’exposition de cette information augmente le risque.

## 11. Brute force et credential stuffing

Le système doit détecter les schémas tels que :

- nombreuses tentatives sur un même compte ;
- nombreuses tentatives depuis une même IP ;
- une IP essayant de nombreux comptes ;
- plusieurs IP essayant le même compte ;
- empreintes d’appareils répétées ;
- listes de mots de passe automatisées ;
- changement rapide de localisation ou ASN.

Réponses possibles :

```text
ALLOW
THROTTLE
DELAY
STEP_UP_AUTH
CAPTCHA_OR_CHALLENGE
TEMPORARY_BLOCK
ACCOUNT_PROTECTION
SOC_ALERT
```

Un blocage automatique ne doit pas permettre à un attaquant de provoquer facilement un déni de service permanent contre une victime.

## 12. Protection OTP

Les OTP doivent être protégés contre :

- génération massive ;
- spam SMS ;
- réutilisation ;
- brute force ;
- concurrence entre plusieurs OTP ;
- contournement du délai de renvoi.

Règles recommandées :

- durée de vie courte ;
- compteur maximal d’essais ;
- cooldown de renvoi ;
- invalidation des anciens codes selon politique ;
- limite par compte, appareil, IP et destination ;
- journalisation sans stocker le code en clair.

## 13. Paiements et opérations financières

Les limites de sécurité ne remplacent jamais les plafonds financiers.

Pour les opérations financières, Mansa doit combiner :

- rate limiting technique ;
- plafonds métier ;
- limites réglementaires ;
- règles risque/fraude ;
- idempotence ;
- contrôle de solde ;
- autorisation ;
- audit.

Une avalanche de requêtes concurrentes ne doit jamais provoquer :

- double débit ;
- double crédit ;
- double remboursement ;
- double retrait ;
- double création de transfert ;
- dépassement de plafond par condition de course.

## 14. Idempotence

Les endpoints financiers mutatifs doivent supporter un mécanisme d’idempotence lorsque nécessaire.

Une clé d’idempotence doit être :

- liée au bon tenant ;
- liée à l’opération ;
- limitée dans le temps ;
- protégée contre collision et réutilisation inter-tenant ;
- journalisée de manière sûre.

La même requête rejouée ne doit pas créer une seconde opération financière.

## 15. WAF

Un Web Application Firewall doit pouvoir être placé devant les surfaces HTTP exposées.

Il doit contribuer à détecter ou bloquer notamment :

- SQL injection ;
- XSS ;
- path traversal ;
- remote file inclusion ;
- payloads anormalement encodés ;
- protocol violations ;
- méthodes HTTP non autorisées ;
- patterns automatisés connus ;
- exploitation de vulnérabilités web courantes.

Le WAF complète le code sécurisé ; il ne justifie jamais l’absence de validation côté application.

## 16. Modes WAF

Les règles doivent pouvoir fonctionner en :

```text
MONITOR
CHALLENGE
BLOCK
```

Un nouveau jeu de règles peut d’abord être observé avant blocage afin d’éviter les faux positifs sur les flux financiers légitimes.

Les changements de mode doivent être auditables.

## 17. Règles gérées et règles Mansa

Mansa peut utiliser :

- règles gérées par le fournisseur edge/WAF ;
- règles OWASP ;
- règles spécifiques Mansa ;
- listes temporaires d’IOC ;
- règles créées à la suite d’un incident.

Les règles spécifiques doivent être versionnées et testées.

## 18. Taille des requêtes

Chaque type d’endpoint doit définir des tailles maximales raisonnables.

Exemples :

- JSON classique : faible limite ;
- justificatif KYC : limite spécifique ;
- image produit : limite spécifique ;
- document PDF : limite spécifique ;
- audio Jini Voice : mécanisme de streaming ou upload contrôlé.

Une requête trop grande doit être rejetée avant de consommer inutilement des ressources backend.

## 19. Timeouts

Les appels doivent disposer de timeouts explicites.

Aucun service ne doit attendre indéfiniment :

- un partenaire bancaire ;
- Mobile Money ;
- une API KYC ;
- un webhook ;
- un service IA ;
- une base distante.

Les timeouts doivent être adaptés au flux et combinés à retry contrôlé, circuit breaker et idempotence lorsque nécessaire.

## 20. Retries

Les retries automatiques doivent être bornés.

Exigences :

- backoff exponentiel lorsque pertinent ;
- jitter ;
- nombre maximal d’essais ;
- respect de l’idempotence ;
- pas de boucle infinie ;
- distinction erreur temporaire / erreur définitive.

## 21. Circuit breaker

Les dépendances externes ou internes fragiles doivent pouvoir être isolées par circuit breaker.

États recommandés :

```text
CLOSED
OPEN
HALF_OPEN
```

Le basculement doit alimenter métriques, logs et alertes.

## 22. Bulkheads

Un service ou partenaire saturé ne doit pas épuiser tous les workers, threads, connexions ou pools du système.

Des limites séparées doivent être prévues lorsque pertinent pour :

- paiements ;
- notifications ;
- KYC ;
- IA ;
- webhooks ;
- exports ;
- traitements batch.

## 23. Anti-DDoS réseau

Pour les environnements exposés à Internet, l’architecture de production doit pouvoir s’appuyer sur un fournisseur ou une infrastructure capable d’absorber ou filtrer des attaques volumétriques en amont.

Les protections peuvent inclure :

- anycast ;
- scrubbing ;
- CDN ;
- filtrage L3/L4 ;
- SYN protection ;
- protection UDP lorsque pertinente ;
- limitation connexion ;
- protection L7.

La stratégie exacte dépend du cloud, hébergeur et pays de déploiement.

## 24. DDoS applicatif

Mansa doit distinguer les attaques volumétriques des attaques coûteuses de couche applicative.

Exemples de routes particulièrement coûteuses :

- recherche complexe ;
- génération de documents ;
- export ;
- IA générative ;
- transcription ;
- analytics ;
- upload ;
- calcul de risque ;
- KYC distant.

Ces routes peuvent avoir des quotas plus stricts et des files de traitement.

## 25. Files et asynchronisme

Les opérations lourdes qui n’ont pas besoin d’une réponse synchrone immédiate doivent pouvoir être déplacées vers des files.

La file doit protéger contre :

- explosion de backlog ;
- message poison ;
- retries infinis ;
- duplication ;
- starvation d’un tenant ;
- saturation mémoire.

## 26. Quotas partenaires

Les partenaires doivent disposer de quotas contractuels configurables.

Exemples :

```text
requests_per_second
requests_per_minute
requests_per_day
concurrent_requests
webhook_rate
export_rate
```

Les quotas peuvent être différents selon :

- environnement sandbox ;
- production ;
- partenaire ;
- produit ;
- niveau de contrat.

## 27. Réponses HTTP de limitation

Lorsqu’une limite est atteinte, le système doit utiliser des réponses cohérentes.

Exemple :

```text
HTTP 429 Too Many Requests
```

Lorsque pertinent, fournir une information de retry sans divulguer des détails permettant de contourner les protections.

## 28. Headers et confiance proxy

Les applications ne doivent pas faire confiance aveuglément à :

- `X-Forwarded-For` ;
- `X-Real-IP` ;
- headers pays ;
- headers d’identité ajoutés par un proxy.

Seuls les proxies/gateways explicitement approuvés peuvent fournir ces informations de confiance.

Le backend doit connaître la chaîne de proxies autorisée.

## 29. CORS

CORS doit être explicitement configuré par environnement.

Éviter :

```text
Access-Control-Allow-Origin: *
```

sur les interfaces authentifiées lorsque ce comportement n’est pas requis.

Les origines autorisées doivent être maîtrisées et les credentials ne doivent être activés qu’en cas de nécessité.

## 30. Méthodes HTTP

Les routes doivent uniquement accepter les méthodes nécessaires.

Une route GET ne doit pas modifier un état financier.

Les méthodes non utilisées peuvent être rejetées au niveau edge/gateway lorsqu’approprié.

## 31. Content-Type

Les endpoints doivent valider le `Content-Type` attendu.

Une API JSON ne doit pas accepter arbitrairement des formats non prévus.

Les uploads doivent vérifier :

- type déclaré ;
- signature/magic bytes lorsque nécessaire ;
- taille ;
- extension ;
- scan sécurité selon le risque.

## 32. Webhooks entrants

Un webhook ne doit jamais être considéré comme authentique uniquement parce qu’il provient d’une URL connue.

Contrôles possibles :

- signature HMAC ;
- signature asymétrique ;
- timestamp ;
- nonce ;
- fenêtre anti-replay ;
- mTLS ;
- allowlist IP comme signal complémentaire ;
- identifiant partenaire.

Les secrets de webhook restent dans le gestionnaire de secrets.

## 33. Anti-replay webhooks

Le système doit détecter la réception répétée d’un même événement.

Il doit conserver selon le flux :

- eventId ;
- partenaire ;
- timestamp ;
- statut de traitement ;
- hash ou signature utile ;
- résultat idempotent.

## 34. API keys

Les API keys doivent :

- être générées avec une entropie suffisante ;
- être affichées en clair seulement lorsque nécessaire à la création ;
- être stockées sous forme protégée/hashée lorsque possible ;
- être révocables ;
- être rotatives ;
- avoir un propriétaire ;
- avoir des scopes ;
- avoir un environnement ;
- avoir des limites de débit.

## 35. OAuth clients et machine-to-machine

Les intégrations serveur-à-serveur doivent préférer des mécanismes adaptés aux identités machines plutôt que des comptes humains partagés.

Les scopes doivent respecter le moindre privilège.

## 36. mTLS

mTLS peut être exigé pour des partenaires ou flux hautement sensibles.

Le cycle de vie des certificats doit couvrir :

- émission ;
- distribution ;
- stockage ;
- rotation ;
- expiration ;
- révocation ;
- inventaire.

## 37. Bot management

Le système doit pouvoir identifier les automates légitimes et malveillants.

Les signaux peuvent inclure :

- réputation IP ;
- ASN ;
- vitesse ;
- comportement ;
- empreinte client ;
- incohérences protocolaires ;
- fréquence ;
- navigation impossible humainement.

Les challenges ne doivent pas rendre les API machine-to-machine légitimes inutilisables.

## 38. CAPTCHA et challenges

Un CAPTCHA ne doit pas être la protection principale de Mansa.

Il peut être utilisé comme challenge adaptatif sur certaines interfaces humaines à risque.

Les applications mobiles et API partenaires nécessitent d’autres mécanismes.

## 39. Listes d’autorisation et blocage

Mansa peut gérer :

```text
ALLOWLIST
BLOCKLIST
WATCHLIST
```

sur :

- IP ;
- CIDR ;
- ASN ;
- pays ;
- API key ;
- appareil ;
- partenaire ;
- tenant.

Toute règle manuelle doit comporter :

- motif ;
- auteur ;
- date ;
- durée ;
- scope ;
- ticket/incident associé si pertinent.

## 40. Blocages temporaires

Les blocages automatiques doivent de préférence être temporaires et progressifs lorsque le risque le permet.

Exemple :

```text
1 minute
5 minutes
30 minutes
2 heures
revue manuelle
```

Le système doit éviter les bannissements permanents accidentels.

## 41. Multi-tenant

Les quotas et protections doivent empêcher qu’un tenant monopolise les ressources communes.

Des limites peuvent être appliquées par organisation afin de préserver les autres clients.

Un tenant compromis ne doit pas pouvoir épuiser tout le quota global.

## 42. Priorités de trafic

Les flux critiques peuvent être classés par priorité.

Exemple :

```text
P0 = autorisation paiement / sécurité
P1 = consultation soldes / transaction critique
P2 = opérations standard
P3 = analytics / export / tâches lourdes
```

En surcharge, les tâches non critiques peuvent être ralenties avant les flux financiers essentiels.

## 43. Load shedding

En cas de surcharge extrême, le système doit pouvoir refuser proprement certaines charges plutôt que s’effondrer complètement.

Le rejet doit :

- être explicite ;
- préserver les opérations déjà engagées ;
- ne pas créer de double débit ;
- être observable ;
- déclencher des alertes selon seuil.

## 44. Protection des bases de données

Le rate limiting edge ne suffit pas.

Les services doivent aussi utiliser :

- pools de connexions bornés ;
- timeouts ;
- requêtes optimisées ;
- pagination ;
- limites sur les recherches ;
- index adaptés ;
- quotas d’exports.

Une requête utilisateur ne doit pas pouvoir lancer une opération non bornée sur des millions de lignes.

## 45. Pagination

Les endpoints de liste doivent imposer une taille maximale de page.

Exemple :

```text
defaultPageSize = configurable
maxPageSize = configurable
```

La valeur maximale doit être raisonnable par domaine.

## 46. Recherche et filtres

Les filtres doivent être validés.

Éviter les expressions arbitraires permettant :

- regex catastrophiques ;
- requêtes trop larges ;
- tris non indexés massifs ;
- combinaisons non bornées.

## 47. GraphQL si utilisé

Si Mansa utilise GraphQL dans certains produits, prévoir :

- limites de profondeur ;
- limites de complexité ;
- limites de taille ;
- persisted queries lorsque pertinent ;
- désactivation de l’introspection en production si la politique le prévoit ;
- quotas par opération.

## 48. WebSocket

Les WebSocket doivent disposer de :

- authentification ;
- expiration de session ;
- limites de connexions ;
- limites de messages ;
- taille maximale ;
- heartbeat ;
- fermeture des clients abusifs ;
- quotas par tenant/utilisateur.

## 49. Jini Voice et streaming

Les flux audio/voix doivent être limités par :

- nombre de sessions simultanées ;
- durée ;
- taille ;
- organisation ;
- contrat ;
- quota IA ;
- coût.

Un attaquant ne doit pas pouvoir déclencher un volume illimité de transcription ou synthèse vocale payante.

## 50. Coûts et attaques économiques

Mansa doit considérer les attaques visant à faire exploser les coûts plutôt qu’à faire tomber le service.

Exemples :

- SMS OTP massifs ;
- appels téléphoniques ;
- IA ;
- KYC payant ;
- géocodage ;
- stockage ;
- exports ;
- appels API tiers facturés.

Des budgets, quotas et coupe-circuits financiers doivent être prévus.

## 51. Journalisation

Les événements edge importants doivent être envoyés vers l’observabilité/SIEM.

Exemples :

```text
RATE_LIMIT_TRIGGERED
WAF_MATCH
WAF_BLOCK
BOT_DETECTED
DDOS_MITIGATION
API_KEY_ABUSE
AUTH_BRUTE_FORCE
WEBHOOK_REPLAY
PAYLOAD_TOO_LARGE
EDGE_RULE_CHANGED
```

## 52. Données à journaliser

Selon confidentialité et minimisation :

- timestamp ;
- requestId/correlationId ;
- route ;
- méthode ;
- tenant ;
- identité pseudonymisée/ID interne ;
- résultat ;
- règle déclenchée ;
- latence ;
- code HTTP ;
- région ;
- signal réseau nécessaire.

Ne jamais journaliser en clair :

- mot de passe ;
- OTP ;
- PIN ;
- PAN complet ;
- CVV ;
- secret API ;
- token bearer complet.

## 53. Corrélation

Chaque requête doit disposer d’un identifiant de corrélation généré ou validé de manière sûre.

Un identifiant fourni par le client peut être remplacé s’il ne respecte pas la politique.

## 54. Métriques

Métriques recommandées :

```text
requests_total
requests_blocked
rate_limit_hits
waf_hits
waf_blocks
requests_by_route
requests_by_tenant
latency_p50_p95_p99
5xx_rate
429_rate
concurrent_requests
queue_depth
partner_timeout_rate
```

## 55. Alertes

Alertes possibles :

- hausse brutale de 429 ;
- hausse de WAF blocks ;
- augmentation des erreurs 5xx ;
- attaque distribuée sur authentification ;
- saturation d’un tenant ;
- forte hausse de coût tiers ;
- augmentation anormale des payloads ;
- perte de visibilité edge.

## 56. Dashboards

Le SOC/SRE doit pouvoir consulter :

- trafic global ;
- trafic par produit ;
- trafic par pays ;
- top routes ;
- top sources bloquées ;
- tenants les plus actifs ;
- attaques en cours ;
- partenaires dégradés ;
- saturation ;
- état WAF ;
- état anti-DDoS.

## 57. Mode incident

Pendant une attaque, un rôle autorisé peut activer temporairement un profil renforcé.

Exemples :

```text
NORMAL
ELEVATED
ATTACK_MODE
LOCKDOWN
```

Chaque activation doit être auditée et réversible.

## 58. Kill switches ciblés

Il doit être possible de désactiver temporairement :

- une route ;
- une API key ;
- un partenaire ;
- une fonctionnalité coûteuse ;
- un pays sur un flux précis si légalement et opérationnellement justifié ;
- un tenant compromis.

Éviter l’arrêt global lorsque l’incident peut être isolé.

## 59. Déploiement progressif des règles

Une nouvelle règle WAF/rate limiting doit pouvoir être déployée progressivement :

1. observation ;
2. métriques ;
3. test sur faible trafic ;
4. élargissement ;
5. blocage complet si validé.

## 60. Tests

Les tests doivent couvrir au minimum :

- dépassement de quota ;
- limite par IP ;
- limite par utilisateur ;
- limite par tenant ;
- brute force distribué ;
- replay webhook ;
- payload trop grand ;
- requête malformée ;
- route inconnue ;
- headers spoofés ;
- retries ;
- timeouts ;
- circuit breaker ;
- idempotence sous concurrence.

## 61. Tests de charge

Avant lancement majeur, réaliser des tests de charge dans un environnement autorisé.

Objectifs :

- identifier le point de saturation ;
- valider le load shedding ;
- valider les autoscalers ;
- vérifier les pools DB ;
- tester les files ;
- mesurer p95/p99 ;
- vérifier que la sécurité reste active sous charge.

## 62. Tests de sécurité

La chaîne de sécurité du dépôt doit compléter cette architecture avec :

- Semgrep ;
- Snyk ;
- GitGuardian ;
- revue de code ;
- tests d’intégration ;
- OWASP ZAP sur staging ;
- tests d’intrusion autorisés selon la maturité du produit.

## 63. Environnements

Les environnements doivent être séparés :

```text
DEVELOPMENT
TEST
STAGING
PRODUCTION
```

Les quotas peuvent être différents, mais les protections structurantes doivent être testables avant production.

## 64. Secrets

Aucun secret WAF, CDN, API Gateway, webhook ou partenaire ne doit être stocké dans Git.

Utiliser le mécanisme de gestion de secrets défini par Mansa.

## 65. Infrastructure as Code

Lorsque l’edge/WAF/gateway est géré en IaC :

- revue obligatoire ;
- historique Git ;
- scan IaC ;
- séparation environnement ;
- rollback ;
- aucun secret en clair.

## 66. RBAC d’administration sécurité

Tous les administrateurs ne doivent pas pouvoir modifier les règles edge.

Permissions possibles :

```text
security.edge.read
security.edge.rate_limit.manage
security.edge.waf.manage
security.edge.blocklist.manage
security.edge.attack_mode.activate
security.edge.audit.read
```

## 67. Double validation

Pour certains changements à fort impact, Mansa doit pouvoir exiger une double validation.

Exemples :

- désactivation globale WAF ;
- allowlist très large ;
- suppression d’une protection d’authentification ;
- passage en lockdown national ;
- modification massive de quotas partenaires.

## 68. Break-glass

Une procédure break-glass peut exister pour incident critique.

Elle doit :

- être limitée ;
- être fortement authentifiée ;
- être temporaire ;
- déclencher une alerte ;
- être entièrement auditée ;
- faire l’objet d’une revue post-incident.

## 69. Haute disponibilité

Le composant de rate limiting distribué ne doit pas devenir un point de panne unique.

Le comportement en cas de perte du service de quotas doit être défini par catégorie :

```text
FAIL_OPEN_LIMITED
FAIL_CLOSED
LOCAL_FALLBACK
```

Un paiement critique et une page publique marketing n’ont pas nécessairement la même politique.

## 70. Mode hors ligne des équipements

Pour les TPE, bornes, contrôleurs de voie ou équipements pouvant fonctionner temporairement hors ligne, les protections cloud ne sont pas toujours disponibles.

Le client local doit donc disposer de limites locales minimales :

- nombre d’essais ;
- fréquence d’opérations ;
- file locale bornée ;
- protection anti-replay ;
- resynchronisation idempotente ;
- journal local protégé.

La reprise réseau ne doit pas provoquer une rafale incontrôlée de requêtes.

## 71. Synchronisation après reconnexion

Lors d’une reconnexion :

- envoyer par lots ;
- appliquer backoff ;
- préserver l’ordre lorsque nécessaire ;
- utiliser idempotence ;
- respecter le rate limiting ;
- ne pas saturer l’API centrale.

## 72. API développeurs

Le portail développeur doit afficher clairement :

- quotas ;
- limites ;
- codes d’erreur ;
- règles de retry ;
- environnement ;
- statut API ;
- bonnes pratiques d’idempotence.

Les détails de détection anti-fraude internes ne doivent pas être exposés.

## 73. Contrats de service partenaires

Les SLA/SLO partenaires doivent préciser lorsque pertinent :

- volume attendu ;
- burst autorisé ;
- timeout ;
- retry ;
- quota ;
- mécanisme d’authentification ;
- fenêtre de maintenance ;
- contact incident.

## 74. Gestion des faux positifs

Tout blocage sécurité doit pouvoir être investigué.

Le support interne doit pouvoir retrouver :

- règle déclenchée ;
- requestId ;
- tenant ;
- heure ;
- résultat ;
- décision.

Il ne doit pas pouvoir désactiver arbitrairement une protection globale sans permission dédiée.

## 75. Confidentialité

Les données edge peuvent contenir des informations sensibles de comportement et réseau.

Appliquer :

- minimisation ;
- rétention limitée ;
- accès RBAC ;
- chiffrement ;
- journalisation des accès ;
- règles de transfert de données applicables.

## 76. Gouvernance des règles

Chaque règle importante doit posséder :

```text
id
name
description
scope
owner
status
mode
priority
createdAt
updatedAt
approvedBy
expiresAt optionnel
incidentReference optionnel
```

## 77. Cycle de vie

États recommandés :

```text
DRAFT
MONITORING
ACTIVE
SUSPENDED
EXPIRED
RETIRED
```

Les règles temporaires créées pendant un incident ne doivent pas rester éternellement sans revue.

## 78. Source de vérité

La configuration de sécurité effective doit être traçable.

Lorsqu’elle est gérée par code, Git/IaC constitue la source de vérité.

Lorsqu’une console fournisseur permet une modification d’urgence, le changement doit être réconcilié ensuite avec la configuration officielle.

## 79. Interdictions

Il est interdit de :

- désactiver globalement une protection pour résoudre un simple bug client ;
- mettre des secrets dans les règles Git ;
- utiliser uniquement l’IP pour authentifier une opération financière ;
- rendre les limites infinies sans justification ;
- ignorer les 429 côté client et retry en boucle ;
- permettre un upload sans taille maximale ;
- exposer un endpoint d’administration edge sans RBAC ;
- considérer le WAF comme remplacement du code sécurisé.

## 80. Critères de sortie avant production

Avant exposition publique d’un nouveau service Mansa :

- TLS validé ;
- WAF/edge défini lorsque pertinent ;
- rate limits configurés ;
- quotas documentés ;
- timeouts présents ;
- retries bornés ;
- taille requêtes bornée ;
- validation des entrées active ;
- logs sans secrets ;
- alertes essentielles configurées ;
- tests de charge réalisés selon criticité ;
- idempotence validée sur les flux financiers ;
- procédures incident documentées.

## 81. Principe final

L’objectif n’est pas de bloquer le trafic légitime, mais de maintenir une plateforme financière disponible, prévisible et sûre même lorsqu’elle subit des erreurs, des pics de trafic, des partenaires défaillants ou des attaques délibérées.

La sécurité edge doit rester configurable, observable, multi-tenant, auditable et indépendante d’un fournisseur unique afin que Mansa puisse être déployé dans différents pays, clouds, infrastructures publiques et environnements partenaires sans réécrire ses principes de protection.
