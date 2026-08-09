# Mansa — Continuité d’activité, sauvegardes et reprise après sinistre

## 1. Objet

Ce document définit le cadre de continuité d’activité, de sauvegarde et de reprise après sinistre de Mansa.

Il couvre l’ensemble des composants critiques de la plateforme :

- API et services backend ;
- bases de données transactionnelles ;
- ledger et wallets ;
- paiements ;
- KYC/KYB ;
- applications client, commerçant, agent et administration ;
- portails État et entreprises ;
- systèmes de péage et mobilité ;
- TPE, bornes et contrôleurs locaux ;
- notifications ;
- stockage documentaire ;
- secrets, clés et certificats ;
- observabilité ;
- intégrations partenaires ;
- files de messages, caches et jobs asynchrones.

L’objectif est que Mansa puisse continuer à fonctionner en mode nominal, dégradé ou local selon la nature de l’incident, puis reprendre proprement sans double débit, perte silencieuse de transactions ni corruption du ledger.

## 2. Principes de référence

La continuité d’activité repose sur les principes suivants :

1. aucune sauvegarde ne doit être considérée valide tant qu’une restauration n’a pas été testée ;
2. aucune reprise ne doit recréer ou doubler une opération financière déjà validée ;
3. le ledger demeure la source financière de référence ;
4. les systèmes locaux doivent pouvoir conserver temporairement les événements autorisés lorsque le réseau est indisponible ;
5. toute resynchronisation doit être idempotente, auditée et réconciliée ;
6. les sauvegardes doivent être séparées des systèmes de production ;
7. une compromission des comptes administrateurs ne doit pas suffire à supprimer simultanément production et sauvegardes ;
8. les dépendances critiques doivent avoir un plan de contournement ou une procédure d’escalade ;
9. la continuité doit être testée régulièrement, pas seulement documentée ;
10. les objectifs de reprise sont définis selon la criticité métier et non par une valeur unique pour toute la plateforme.

## 3. Définitions

### 3.1 RTO

`RTO` — Recovery Time Objective : durée maximale cible avant restauration d’un service après interruption.

### 3.2 RPO

`RPO` — Recovery Point Objective : quantité maximale cible de données que l’organisation accepte de devoir reconstruire après un incident.

### 3.3 PRA

`PRA` — Plan de Reprise d’Activité : procédures permettant de restaurer les systèmes après une panne ou un sinistre majeur.

### 3.4 PCA

`PCA` — Plan de Continuité d’Activité : ensemble des mécanismes permettant de maintenir les fonctions essentielles pendant l’incident.

## 4. Classification des services

Les services doivent être classés par criticité.

### Tier 0 — Critique financier

Exemples :

- ledger ;
- wallets ;
- moteur d’autorisation financière ;
- idempotence des paiements ;
- écritures de règlement ;
- sessions et contrôles indispensables aux opérations financières.

Objectif : priorité maximale de continuité et de restauration.

### Tier 1 — Critique opérationnel

Exemples :

- API de paiement ;
- API agents ;
- paiements commerçants ;
- péages ;
- authentification ;
- KYC nécessaire à une opération réglementée ;
- gestion des terminaux.

### Tier 2 — Important

Exemples :

- notifications ;
- reporting ;
- portails de gestion non transactionnels ;
- exports ;
- tableaux de bord.

### Tier 3 — Différable

Exemples :

- contenus marketing ;
- certaines fonctions analytiques ;
- tâches non urgentes ;
- traitements batch pouvant être rejoués.

## 5. Objectifs de reprise indicatifs

Les valeurs définitives sont configurées par environnement et niveau de maturité, mais les cibles recommandées sont :

```text
Tier 0 : RTO <= 15 min ; RPO proche de 0 pour les écritures financières confirmées
Tier 1 : RTO <= 30 min ; RPO <= 5 min lorsque techniquement possible
Tier 2 : RTO <= 4 h ; RPO <= 1 h
Tier 3 : RTO <= 24 h ; RPO <= 24 h
```

Ces valeurs sont des objectifs techniques internes et ne doivent pas être présentées comme SLA contractuels tant qu’elles n’ont pas été mesurées et validées.

## 6. Architecture de sauvegarde

La politique doit respecter une approche de type `3-2-1` renforcée lorsque pertinent :

- plusieurs copies ;
- au moins deux supports ou mécanismes distincts ;
- au moins une copie hors du domaine de panne principal ;
- une copie immuable ou protégée contre suppression pendant sa fenêtre de rétention.

Les sauvegardes ne doivent pas dépendre exclusivement du même compte cloud, du même projet ou des mêmes identifiants administratifs que la production.

## 7. Sauvegardes bases de données

Pour PostgreSQL et autres bases transactionnelles :

- snapshots réguliers ;
- sauvegardes complètes ;
- journalisation permettant un point-in-time recovery lorsque disponible ;
- chiffrement au repos et en transit ;
- contrôle d’accès minimal ;
- rétention configurable ;
- vérification d’intégrité ;
- restauration testée.

Les sauvegardes doivent inclure les métadonnées nécessaires à une reconstruction cohérente : schéma, migrations, extensions nécessaires, versions compatibles et paramètres critiques.

## 8. Ledger et données financières

Le ledger exige un niveau de protection supérieur.

Les règles minimales sont :

- aucune écriture financière confirmée ne doit être modifiée silencieusement ;
- les corrections utilisent des écritures compensatoires ou procédures explicitement prévues ;
- toute restauration doit préserver l’ordre logique des événements ;
- les clés d’idempotence doivent être conservées assez longtemps pour empêcher un rejeu accidentel après reprise ;
- les transactions externes doivent être rapprochées avec les partenaires après reprise ;
- aucun solde ne doit être recalculé à partir d’une source non autoritative sans procédure contrôlée.

Après restauration, un processus de rapprochement obligatoire vérifie :

```text
ledger Mansa
vs
wallets
vs
paiements internes
vs
acquéreurs
vs
Mobile Money
vs
banques partenaires
vs
agents/caisse
vs
transactions péage lorsque concerné
```

## 9. Stockage objet et documents

Les documents KYC, reçus, justificatifs et autres fichiers sensibles doivent avoir :

- versioning ou mécanisme de récupération lorsque nécessaire ;
- sauvegarde séparée ;
- chiffrement ;
- politique de rétention ;
- suppression conforme à la gouvernance des données ;
- contrôle d’intégrité ;
- journalisation des restaurations administratives.

Les données supprimées conformément à une obligation légale ou politique de rétention ne doivent pas être restaurées indéfiniment depuis une sauvegarde sans mécanisme de purge post-restauration.

## 10. Secrets, clés et certificats

Les sauvegardes applicatives ne doivent pas contenir des secrets en clair.

Les clés cryptographiques, secrets, certificats et configurations sensibles sont gérés via les mécanismes prévus par le cadre KMS/HSM/secrets de Mansa.

Une reprise doit prévoir :

- disponibilité des clés nécessaires ;
- rotation après compromission ;
- révocation de certificats ;
- séparation entre sauvegarde des données et sauvegarde des secrets ;
- procédure d’accès d’urgence contrôlée.

## 11. Multi-zone et multi-région

Lorsque l’infrastructure le permet, les composants critiques doivent pouvoir utiliser :

- redondance multi-zone ;
- réplication ;
- équilibrage ;
- instances de secours ;
- bascule contrôlée.

Une architecture multi-région ne doit être activée qu’avec une stratégie explicite concernant :

- cohérence des données ;
- latence ;
- résidence des données ;
- coûts ;
- conflits d’écriture ;
- ordre des transactions ;
- retour vers la région principale.

## 12. Bascule

Les modes minimaux sont :

```text
ACTIVE_ACTIVE
ACTIVE_PASSIVE
WARM_STANDBY
COLD_STANDBY
LOCAL_DEGRADED
MANUAL_RECOVERY
```

Chaque service choisit le mode adapté à sa criticité.

Une bascule automatique n’est autorisée que si elle ne crée pas de risque financier supérieur à l’interruption elle-même.

## 13. Réseau indisponible

Les applications et équipements qui nécessitent un fonctionnement local doivent utiliser un mode hors ligne strictement borné.

Le mode hors ligne peut conserver :

- règles préautorisées ;
- listes de blocage/autorisation en cache ;
- tarifs ;
- plafonds ;
- événements locaux ;
- horodatage ;
- clés d’idempotence ;
- journaux protégés contre altération.

Il ne doit pas permettre une augmentation incontrôlée du risque financier.

## 14. Reprise et resynchronisation hors ligne

Au retour du réseau :

1. authentifier le terminal ou contrôleur ;
2. vérifier son état et sa version ;
3. charger les événements locaux non synchronisés ;
4. trier et valider leur ordre ;
5. appliquer l’idempotence ;
6. rejeter les doublons ;
7. traiter les événements acceptables ;
8. isoler les conflits ;
9. rapprocher les montants ;
10. confirmer la synchronisation ;
11. conserver une trace d’audit.

Aucun terminal ne doit pouvoir provoquer deux débits en renvoyant un événement déjà traité.

## 15. Péages — exigences de référence

Les exigences suivantes sont conservées explicitement pour le domaine péage et État.

Deux solutions initiales coexistent :

- **A — péage automatique classique avec barrière** ;
- **B — télépéage RFID UHF avec barrière**.

Une évolution future optionnelle vers du free-flow sans barrière peut être ajoutée, sans remplacer A ni B.

Le péage classique doit pouvoir accepter, selon les canaux activés :

- billets FCFA/XOF ;
- pièces FCFA/XOF ;
- carte bancaire EMV ;
- réseaux carte activés par l’acquéreur, notamment Visa et Mastercard lorsqu’ils sont contractuellement disponibles ;
- NFC ;
- carte Mansa ;
- wallet Mansa ;
- QR ;
- Mobile Money.

Mobile Money reste activable/désactivable par l’administration au niveau national, réseau, poste ou voie, avec date d’effet et audit. Il ne doit jamais être supprimé automatiquement.

Le télépéage initial utilise :

- tags UHF RFID passifs ;
- association tag/véhicule/compte ;
- lecteur/antenne ;
- contrôleur local ;
- relais `OPEN` ;
- barrière ;
- capteurs de passage.

## 16. Continuité spécifique péages

En cas de coupure réseau, le contrôleur de voie peut continuer selon une politique locale bornée.

Il doit pouvoir conserver :

- tarifs valides ;
- règles minimales ;
- abonnements ou autorisations mises en cache ;
- liste de tags bloqués ;
- plafonds hors ligne ;
- transactions locales ;
- ouvertures de barrière ;
- événements capteurs ;
- événements ANPR/RFID nécessaires à l’audit.

Après reconnexion :

- resynchronisation automatique ;
- déduplication ;
- aucune double facturation ;
- rapprochement véhicule/catégorie/tarif/paiement/ouverture/passage ;
- audit des ouvertures manuelles.

Le matériel reste multi-fournisseurs et piloté derrière des adaptateurs utilisant relais/contact sec ou interfaces industrielles documentées lorsque pertinent.

## 17. Trois niveaux d’équipement péage

Le PCA/PRA doit prendre en compte :

1. **voie automatique complète** : borne, espèces, carte, QR, contrôleur, barrière, capteurs ;
2. **voie semi-automatique** : agent, caisse sécurisée, terminal et audit ;
3. **poste numérisé à faible coût** : matériel existant conservé avec application/terminal Mansa et perception manuelle contrôlée.

La continuité ne doit donc pas supposer que tous les péages disposent du même niveau d’équipement.

## 18. Déploiement progressif et modèles commerciaux

Le plan de continuité doit fonctionner que le matériel soit :

- acheté directement par l’État ou le concessionnaire ;
- fourni, intégré ou revendu par Mansa.

Il doit également fonctionner pendant un déploiement progressif : certains sites peuvent être automatisés pendant que d’autres restent semi-automatiques ou numérisés.

Les éléments peuvent être en marque blanche État/concessionnaire : bornes, tags, écrans, reçus et signalétique, avec mention facultative `Propulsé par Mansa`.

## 19. Files de messages et traitements asynchrones

Les systèmes de queue doivent prendre en charge :

- persistance adaptée ;
- redelivery contrôlée ;
- idempotence ;
- dead-letter queue ;
- visibilité des échecs ;
- replay contrôlé ;
- ordre lorsque nécessaire ;
- protection contre la boucle infinie.

Un replay d’événements ne doit pas produire de nouveau paiement si l’opération financière existe déjà.

## 20. Caches

Les caches ne sont pas sources de vérité pour les soldes financiers.

Après reprise :

- ils peuvent être invalidés ;
- reconstruits depuis la source autoritative ;
- réchauffés progressivement ;
- vérifiés contre les données réelles.

La perte d’un cache ne doit pas provoquer la perte d’une transaction confirmée.

## 21. Sauvegardes de configuration

Les configurations critiques doivent être versionnées et restaurables :

- règles de frais ;
- politiques d’accès ;
- configuration des pays ;
- limites ;
- canaux de paiement ;
- règles Mobile Money ;
- paramètres péage ;
- configurations TPE et bornes ;
- politiques de sécurité ;
- feature flags.

Les modifications doivent avoir auteur, date d’effet et historique lorsque la fonction est sensible.

## 22. Dépendances externes

Pour chaque fournisseur critique, Mansa doit documenter :

- service fourni ;
- criticité ;
- contacts d’escalade ;
- SLA connu ;
- comportement en cas de panne ;
- retry ;
- timeout ;
- circuit breaker ;
- fallback possible ;
- procédure de rapprochement après reprise.

Exemples : banque partenaire, acquéreur, Mobile Money, SMS, email, KYC, stockage, cloud, DNS, CDN.

## 23. Dégradation contrôlée

Un incident ne doit pas forcément arrêter toute la plateforme.

Le moteur peut désactiver uniquement :

- un fournisseur ;
- un canal de paiement ;
- une fonctionnalité ;
- une zone ;
- un pays ;
- un type d’équipement ;
- une voie de péage.

Les autres fonctions restent actives lorsqu’elles sont sûres.

## 24. États opérationnels

Les statuts minimaux sont :

```text
HEALTHY
DEGRADED
PARTIAL_OUTAGE
MAJOR_OUTAGE
RECOVERY_IN_PROGRESS
READ_ONLY
LOCAL_OFFLINE
SUSPENDED
RESTORED
```

Chaque transition doit être datée et observable.

## 25. Mode lecture seule

Lorsqu’une opération d’écriture devient dangereuse mais que les données restent accessibles, certains services peuvent passer en `READ_ONLY`.

Exemples :

- afficher historique ;
- consulter profil ;
- consulter statut ;
- afficher solde avec avertissement si fraîcheur non garantie.

Les actions financières sont bloquées si l’intégrité ne peut pas être garantie.

## 26. Sauvegarde avant changement majeur

Avant :

- migration risquée ;
- upgrade majeur ;
- changement de schéma critique ;
- modification d’infrastructure sensible ;

le pipeline doit vérifier :

- sauvegarde récente ;
- procédure de rollback ;
- compatibilité des migrations ;
- capacité de restauration ;
- fenêtre opérationnelle appropriée.

## 27. Migrations de base de données

Les migrations doivent être conçues pour limiter les interruptions.

Pratiques recommandées :

- migrations backward-compatible lorsque possible ;
- expand/contract ;
- changement progressif ;
- sauvegarde préalable pour opérations destructrices ;
- validation avant suppression de colonne/table ;
- rollback documenté.

Les migrations financières critiques nécessitent une validation renforcée.

## 28. Ransomware et compromission

Le plan doit inclure une hypothèse de compromission :

- comptes cloud compromis ;
- suppression de ressources ;
- chiffrement malveillant ;
- secrets volés ;
- CI compromise ;
- accès administrateur malveillant.

Mesures :

- backups immuables ;
- séparation des comptes ;
- MFA ;
- moindre privilège ;
- journaux centralisés ;
- KMS/HSM ;
- rotation ;
- procédure de coupure d’urgence ;
- restauration dans un environnement propre.

## 29. Site de reprise propre

En cas d’incident cyber sévère, Mansa doit pouvoir reconstruire un environnement de confiance à partir :

- infrastructure as code validée ;
- images signées ;
- artefacts de provenance vérifiée ;
- sauvegardes restaurables ;
- secrets nouvellement émis ;
- configurations versionnées.

La reprise ne doit pas réintroduire automatiquement l’élément compromis.

## 30. Ordre de restauration

Ordre recommandé :

1. identité, secrets et socle réseau ;
2. bases de données critiques ;
3. ledger ;
4. moteur d’autorisation ;
5. wallets/paiements ;
6. authentification et RBAC ;
7. API métiers Tier 1 ;
8. files et workers ;
9. intégrations externes ;
10. applications clientes ;
11. reporting et services Tier 2/3.

L’ordre peut varier selon l’architecture réelle, mais les dépendances doivent être documentées.

## 31. Vérifications après restauration

Avant réouverture complète :

- intégrité base ;
- migrations appliquées ;
- services critiques sains ;
- secrets/certificats valides ;
- horloges synchronisées ;
- idempotence fonctionnelle ;
- soldes cohérents ;
- files d’événements sous contrôle ;
- intégrations partenaires testées ;
- rapprochement financier lancé ;
- monitoring actif.

## 32. Tests de restauration

Les tests doivent inclure :

- restauration d’une base dans un environnement isolé ;
- point-in-time recovery ;
- restauration d’un fichier/document ;
- reconstruction complète d’un service ;
- perte d’une zone ;
- indisponibilité d’un fournisseur ;
- coupure réseau d’un terminal ;
- resynchronisation après mode hors ligne ;
- restauration du ledger suivie d’un rapprochement ;
- simulation de suppression accidentelle.

## 33. Exercices PRA

Au minimum, les exercices doivent produire :

- scénario ;
- date ;
- participants ;
- environnement ;
- temps de détection ;
- temps de décision ;
- temps de restauration ;
- RTO observé ;
- RPO observé ;
- erreurs ;
- actions correctives ;
- responsable ;
- échéance.

## 34. Tests péage

Les scénarios péage doivent inclure :

- perte réseau d’une voie ;
- perte connexion cloud ;
- panne lecteur RFID ;
- panne ANPR ;
- panne terminal carte ;
- panne Mobile Money ;
- monnayeur indisponible ;
- rendu de monnaie indisponible ;
- redémarrage contrôleur ;
- resynchronisation de transactions locales ;
- tentative de double débit ;
- ouverture manuelle pendant incident ;
- rapprochement véhicule/paiement/passage après reprise.

## 35. Données de test

Les exercices ne doivent pas exposer des données personnelles ou secrets réels inutilement.

Les tests utilisent de préférence :

- données synthétiques ;
- identifiants fictifs ;
- comptes sandbox ;
- secrets temporaires.

## 36. Journal d’incident

Chaque incident significatif doit enregistrer :

- identifiant ;
- début ;
- détection ;
- services affectés ;
- utilisateurs affectés ;
- pays/tenant affecté ;
- statut ;
- cause ;
- décisions ;
- bascules ;
- restauration ;
- rapprochement ;
- fin ;
- post-mortem.

## 37. Communication

Le plan doit définir plusieurs niveaux de communication :

- équipe technique ;
- direction ;
- support ;
- partenaires ;
- clients entreprises ;
- administrations ;
- utilisateurs finaux lorsque nécessaire.

Les messages doivent distinguer clairement :

- panne technique ;
- paiement refusé ;
- canal indisponible ;
- maintenance ;
- incident de sécurité.

Une panne de Mansa ne doit pas être présentée comme un refus bancaire du client.

## 38. Post-mortem

Après incident majeur :

- chronologie ;
- impact ;
- cause racine ;
- facteurs aggravants ;
- contrôles ayant fonctionné ;
- contrôles ayant échoué ;
- données perdues ou reconstruites ;
- rapprochement financier ;
- actions correctives ;
- dates et responsables.

L’objectif est l’amélioration du système, pas la suppression de traces.

## 39. Portail d’administration

Le portail doit pouvoir afficher :

```text
Operations
├── Service Health
├── Incidents
├── Backups
├── Restore Tests
├── DR Plans
├── Recovery Exercises
├── Dependencies
├── Offline Devices
├── Reconciliation
└── Audit
```

Les actions de restauration et bascule doivent être réservées aux rôles autorisés et soumises à audit.

## 40. Métriques

Métriques recommandées :

- succès des backups ;
- âge de la dernière sauvegarde valide ;
- durée backup ;
- durée restauration ;
- RTO réel ;
- RPO réel ;
- fréquence tests de restauration ;
- nombre d’échecs de backup ;
- files en attente ;
- événements hors ligne non synchronisés ;
- divergences de rapprochement ;
- temps de bascule ;
- incidents par fournisseur.

## 41. Alertes

Alertes prioritaires :

- backup critique échoué ;
- aucune sauvegarde valide récente ;
- réplication interrompue ;
- RPO menacé ;
- stockage backup presque plein ;
- copie immuable absente ;
- test de restauration échoué ;
- divergence ledger/partenaire après reprise ;
- accumulation anormale de transactions hors ligne.

## 42. Rétention

Les durées de conservation dépendent :

- réglementation ;
- nature des données ;
- contrats ;
- besoin d’audit ;
- coût ;
- politique de confidentialité.

Une sauvegarde ne doit pas servir de mécanisme pour conserver indéfiniment une donnée dont la suppression est requise.

## 43. Responsabilités

Rôles possibles :

```text
Incident Commander
Technical Lead
Database Recovery Lead
Security Lead
Payments/Reconciliation Lead
Infrastructure Lead
Communications Lead
Business Owner
Auditor
```

Les responsabilités doivent pouvoir être assurées même si une personne clé est indisponible.

## 44. Séparation des tâches

Les opérations sensibles peuvent exiger double contrôle :

- suppression d’une sauvegarde immuable ;
- restauration production ;
- bascule région ;
- utilisation d’accès d’urgence ;
- modification d’un RPO/RTO critique ;
- clôture d’un rapprochement présentant un écart important.

## 45. Documentation exécutable

Les runbooks doivent être aussi proches que possible d’instructions reproductibles :

- commandes ;
- prérequis ;
- vérifications ;
- rollback ;
- critères d’arrêt ;
- résultats attendus.

Les procédures obsolètes sont versionnées ou archivées, pas laissées comme instructions actives.

## 46. Automatisation

Lorsque sûr, automatiser :

- backups ;
- contrôle de fraîcheur ;
- restauration de test ;
- vérification d’intégrité ;
- bascule technique ;
- resynchronisation ;
- rapprochement ;
- création d’alertes.

L’automatisation ne supprime pas les validations humaines nécessaires aux opérations financières ou de sécurité à haut risque.

## 47. Critères de conformité interne

Un service critique n’est pas considéré prêt pour production si :

- aucune stratégie de backup n’existe ;
- aucune restauration n’a été testée ;
- aucun RTO/RPO n’est défini ;
- l’idempotence après replay n’est pas démontrée ;
- aucune procédure de rapprochement n’existe ;
- aucune dépendance critique n’est documentée ;
- un mode hors ligne existe sans règle de resynchronisation ;
- une seule identité permet de supprimer production et toutes les sauvegardes.

## 48. Critères de sortie d’incident

Un incident financier critique ne peut être déclaré totalement clos avant :

- restauration des services ;
- vérification d’intégrité ;
- synchronisation des terminaux concernés ;
- rapprochement des transactions ;
- résolution ou qualification des écarts ;
- conservation des preuves et journaux ;
- création des actions correctives.

## 49. Évolution

Ce cadre doit évoluer avec :

- nouveaux pays ;
- nouvelles banques ;
- nouveaux acquéreurs ;
- nouveaux Mobile Money ;
- nouvelles régions cloud ;
- nouveaux matériels ;
- nouveaux services État ;
- évolution future du free-flow péage.

Toute évolution doit préserver les invariants : intégrité financière, absence de double débit, auditabilité, reprise testée et compatibilité avec les modes locaux nécessaires.
