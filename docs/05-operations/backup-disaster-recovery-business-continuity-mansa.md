# MANSA — Sauvegarde, restauration, PRA/PCA et continuité métier

## 1. Objet

Ce document définit les exigences de sauvegarde, restauration, reprise après sinistre, continuité d’activité et résilience des données pour l’écosystème Mansa.

Il complète les cahiers des charges d’architecture, sécurité, observabilité, paiements, wallets, ledger, KYC, secteur public, commerce, agents, téléphonie et Access & Mobility. Il ne remplace pas leurs règles métier.

L’objectif est de garantir qu’une panne, une erreur humaine, une corruption de données, une indisponibilité fournisseur, une perte de région cloud ou un incident de sécurité n’entraîne ni perte silencieuse de fonds, ni double traitement, ni restauration incohérente.

## 2. Principes non négociables

Mansa doit appliquer les principes suivants :

- sauvegardes automatisées et vérifiables ;
- restauration régulièrement testée ;
- séparation des sauvegardes et de l’environnement principal ;
- chiffrement des sauvegardes au repos et en transit ;
- contrôle d’accès strict aux sauvegardes ;
- immutabilité ou protection contre suppression altérable pour les sauvegardes critiques ;
- journalisation de toute restauration ;
- aucune restauration directe en production sans procédure contrôlée ;
- cohérence entre base opérationnelle, ledger financier, fichiers, objets et journaux d’audit ;
- reprise sans double débit ni double crédit ;
- resynchronisation idempotente des systèmes hors ligne ;
- tests de reprise planifiés et documentés.

## 3. Périmètre des données à protéger

Le plan de sauvegarde doit couvrir au minimum :

```text
PostgreSQL / données transactionnelles
Ledger et écritures financières
Wallets et soldes calculés
Identité / authentification / sessions selon politique
KYC / KYB et documents associés
Paiements et transferts
Rapprochement et règlement
Agents et opérations espèces
Commerce / commandes / factures / stocks
Secteur public et paiements administratifs
Access & Mobility / passages / abonnements / péages
Jini Voice : métadonnées, configurations et données conservées selon politique
Configurations multi-tenant
Feature flags et paramètres sensibles
Secrets : uniquement via le gestionnaire de secrets, jamais via sauvegarde Git
Stockage objet
Journaux d’audit
Configurations infrastructure et IaC
Clés publiques, certificats non secrets et métadonnées nécessaires à la reprise
```

Les secrets privés, clés maîtresses et identifiants de production doivent être sauvegardés via le mécanisme sécurisé du fournisseur de secrets/KMS/HSM, selon procédures dédiées, et jamais copiés en clair dans une archive générale.

## 4. Classification de criticité

Chaque domaine doit être classé selon un niveau de criticité.

### Tier 0 — Critique financier

Exemples :

- ledger ;
- soldes ;
- écritures de paiement ;
- transferts ;
- règlement ;
- rapprochement ;
- clés et métadonnées nécessaires aux transactions.

Exigence : perte de données minimale, restauration prioritaire, double validation.

### Tier 1 — Critique opérationnel

Exemples :

- identité ;
- KYC ;
- permissions ;
- agents ;
- secteur public ;
- péage ;
- abonnements ;
- commandes.

### Tier 2 — Important

Exemples :

- analytics dérivés ;
- notifications ;
- préférences ;
- contenus non financiers ;
- journaux techniques reconstructibles.

### Tier 3 — Reconstructible

Exemples :

- caches ;
- artefacts temporaires ;
- previews ;
- données dérivées pouvant être recalculées.

## 5. RPO et RTO

Les objectifs doivent être configurables par environnement et domaine.

Définitions :

```text
RPO = quantité maximale acceptable de données perdues dans le temps
RTO = durée maximale acceptable avant remise en service
```

Objectifs initiaux recommandés, à valider contractuellement :

| Niveau | RPO cible | RTO cible |
|---|---:|---:|
| Tier 0 | ≤ 5 minutes | ≤ 60 minutes |
| Tier 1 | ≤ 15 minutes | ≤ 4 heures |
| Tier 2 | ≤ 24 heures | ≤ 24 heures |
| Tier 3 | reconstruction | selon besoin |

Ces valeurs constituent des objectifs techniques initiaux et non une promesse contractuelle automatique.

## 6. Stratégie PostgreSQL

Pour PostgreSQL, Mansa doit prévoir :

- sauvegardes complètes planifiées ;
- WAL / point-in-time recovery lorsque l’infrastructure le permet ;
- snapshots complémentaires ;
- réplication haute disponibilité distincte des sauvegardes ;
- validation automatique des archives ;
- restauration vers une nouvelle instance pour test.

Une réplication n’est jamais considérée comme une sauvegarde : une suppression logique ou une corruption peut se répliquer.

## 7. Point-in-time recovery

Le PITR doit permettre de restaurer la base à un instant avant :

- suppression accidentelle ;
- migration défectueuse ;
- import incorrect ;
- corruption logique ;
- déploiement ayant écrit des données erronées.

Avant une restauration PITR, l’équipe doit enregistrer :

- incident ;
- heure cible ;
- justification ;
- périmètre ;
- impact ;
- valideurs ;
- stratégie de rapprochement après restauration.

## 8. Ledger financier et restauration

Le ledger est la source d’audit financier et ne doit pas être restauré sans vérification métier.

Après restauration, Mansa doit vérifier :

```text
somme des débits = somme des crédits
aucune écriture orpheline
aucune transaction appliquée deux fois
aucune transaction confirmée absente du ledger
aucun solde matérialisé incompatible avec le ledger
```

Les soldes dérivés doivent pouvoir être recalculés depuis les écritures lorsque le modèle le permet.

Les opérations externes intervenues après le point de restauration doivent être rapprochées avant réouverture complète du service.

## 9. Paiements externes et risque de double traitement

Une restauration de base ne doit jamais provoquer la réémission automatique d’un paiement déjà envoyé à :

- banque ;
- acquéreur ;
- réseau carte ;
- Mobile Money ;
- partenaire de paiement ;
- administration ;
- autre fournisseur externe.

Chaque opération externe doit utiliser :

- clé d’idempotence ;
- identifiant partenaire ;
- statut local ;
- statut distant ;
- horodatage ;
- journal de tentative ;
- mécanisme de rapprochement.

Après reprise, les opérations `UNKNOWN`, `PENDING`, `SENT` ou ambiguës sont rapprochées avant nouvelle tentative.

## 10. Stockage objet et documents

Pour les documents KYC, justificatifs, reçus, factures et fichiers métier :

- versioning objet lorsque pertinent ;
- chiffrement ;
- contrôle d’accès ;
- politique de rétention ;
- réplication ou copie inter-zone/région selon criticité ;
- vérification de checksum ;
- restauration testée.

Les données soumises à suppression réglementaire ne doivent pas être conservées indéfiniment dans les sauvegardes sans base légale.

## 11. Sauvegardes immuables

Pour les données critiques, une copie doit être protégée contre :

- suppression par un compte applicatif ;
- ransomware ;
- altération malveillante ;
- erreur d’administration.

Selon l’infrastructure, cela peut utiliser :

- Object Lock / WORM ;
- compte cloud séparé ;
- coffre de sauvegarde ;
- politiques de rétention verrouillées ;
- stockage hors ligne ou hors compte principal.

## 12. Séparation des responsabilités

Aucune personne ne doit disposer seule de toutes les capacités suivantes en production :

```text
modifier les données
supprimer les sauvegardes
restaurer la production
modifier les journaux d’audit
```

Les opérations sensibles doivent permettre séparation des rôles, approbation et journalisation.

## 13. Chiffrement et clés

Les sauvegardes doivent utiliser des clés de chiffrement gérées par KMS/HSM ou mécanisme équivalent.

Exigences :

- rotation des clés ;
- accès audité ;
- permissions minimales ;
- procédure de récupération des clés ;
- interdiction d’écrire les clés dans Git, scripts ou images Docker ;
- test de restauration avec les clés réellement nécessaires.

Une sauvegarde chiffrée impossible à déchiffrer lors d’un sinistre est considérée comme inutilisable.

## 14. Environnements

Les environnements `development`, `test`, `staging` et `production` doivent être séparés.

Il est interdit de restaurer automatiquement une base de production contenant des données personnelles complètes dans un environnement non-production.

Lorsqu’une copie est nécessaire pour diagnostic :

- anonymisation ;
- pseudonymisation ;
- réduction des données ;
- contrôle d’accès ;
- durée de conservation courte.

## 15. Test de restauration

Une sauvegarde n’est considérée valide que si elle peut être restaurée.

Tests minimaux :

- restauration automatisée sur environnement isolé ;
- validation schéma ;
- validation migrations ;
- vérification checksums ;
- tests de lecture ;
- tests ledger ;
- tests d’authentification technique ;
- contrôle des objets/fichiers ;
- mesure du temps réel de restauration.

## 16. Fréquence de tests

Cadence recommandée :

```text
hebdomadaire : restauration technique automatisée d’un échantillon
mensuelle : restauration complète d’environnement critique
trimestrielle : exercice PRA inter-services
annuelle : exercice de sinistre majeur incluant fournisseurs externes
```

La fréquence finale doit être ajustée aux obligations réglementaires et SLA.

## 17. Runbook de restauration

Chaque service critique doit disposer d’un runbook versionné comprenant :

1. conditions de déclenchement ;
2. responsables ;
3. verrouillage des écritures si nécessaire ;
4. sélection du point de restauration ;
5. restauration ;
6. contrôles d’intégrité ;
7. rapprochement financier ;
8. reprise des files/messages ;
9. reprise des intégrations externes ;
10. réouverture progressive ;
11. surveillance renforcée ;
12. clôture et post-mortem.

## 18. Files, événements et messages

Les systèmes asynchrones doivent supporter :

- idempotence des consommateurs ;
- replay contrôlé ;
- dead-letter queue ;
- conservation suffisante pour reprise ;
- déduplication ;
- ordre lorsque requis ;
- corrélation transactionnelle.

Après restauration d’une base, le système ne doit pas rejouer aveuglément tous les messages historiques.

## 19. Services hors ligne et synchronisation

Les applications et contrôleurs locaux peuvent continuer en mode dégradé lorsque prévu.

Au retour du réseau :

- synchronisation idempotente ;
- aucune double transaction ;
- conservation de l’ordre lorsque nécessaire ;
- résolution de conflits ;
- journalisation ;
- alerte en cas d’écart.

Pour les péages, les exigences de référence restent :

- coexistence du péage automatique classique avec barrière et du télépéage RFID avec barrière ;
- free-flow futur optionnel sans remplacement des deux solutions initiales ;
- support configurable des billets/pièces FCFA, EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money ;
- Mobile Money activable/désactivable par niveau administratif avec audit ;
- télépéage UHF RFID passif associé véhicule/compte avec lecteur, contrôleur, relais OPEN, barrière et capteurs ;
- fonctionnement hors ligne sécurisé, resynchronisation et absence de double débit ;
- matériel multi-fournisseurs derrière adaptateurs ;
- audit de toute ouverture manuelle et rapprochement véhicule/catégorie/tarif/paiement/ouverture/passage.

## 20. Dépendances externes

Pour chaque fournisseur critique, Mansa doit documenter :

- service concerné ;
- identifiants de compte de secours ;
- procédure d’escalade ;
- RTO fournisseur ;
- données locales conservées ;
- possibilité de bascule ;
- mode dégradé ;
- procédure de rapprochement après retour.

Les dépendances incluent notamment cloud, banque partenaire, acquéreur, Mobile Money, SMS, email, KYC, stockage, DNS et téléphonie.

## 21. Multi-région et haute disponibilité

La haute disponibilité n’est pas la même chose que le PRA.

Mansa peut utiliser :

```text
multi-AZ
réplication régionale
read replicas
standby chaud
standby froid
active-passive
```

Le choix doit être fondé sur criticité, coût, RPO/RTO, réglementation et capacité opérationnelle.

Une architecture multi-région ne doit pas être activée sans stratégie claire de cohérence, failover et failback.

## 22. Bascule et retour arrière

Chaque bascule doit préciser :

- source ;
- destination ;
- critères de décision ;
- autorité de déclenchement ;
- propagation DNS/routage ;
- état des écritures ;
- gestion des sessions ;
- reprise des jobs ;
- stratégie de retour vers la région principale.

Le failback est traité comme une opération de production à risque, pas comme un simple changement DNS.

## 23. Incident cyber

En cas de compromission ou ransomware :

- isoler les systèmes concernés ;
- préserver les preuves ;
- ne pas restaurer immédiatement sur une infrastructure potentiellement compromise ;
- identifier la fenêtre de compromission ;
- choisir un point de sauvegarde antérieur fiable ;
- faire tourner/rotater secrets et clés selon besoin ;
- reconstruire l’infrastructure depuis des sources approuvées ;
- restaurer les données ;
- rapprocher les transactions ;
- surveiller après reprise.

## 24. Migration défectueuse

Toute migration de base importante doit prévoir :

- backup/snapshot pré-migration ;
- script de validation ;
- plan rollback ou forward-fix ;
- compatibilité temporaire lorsque nécessaire ;
- surveillance après déploiement.

Une migration destructive irréversible doit être déployée par étapes.

## 25. Suppression accidentelle

Le système doit permettre une récupération contrôlée après :

- suppression de tenant ;
- suppression de compte ;
- suppression de document ;
- suppression de configuration ;
- suppression d’objet métier.

La restauration ne doit pas contourner les politiques légales de suppression ou ressusciter silencieusement un compte volontairement supprimé.

## 26. Données personnelles et rétention

Les sauvegardes doivent respecter :

- durée de conservation définie ;
- obligations réglementaires ;
- droit à suppression lorsque applicable ;
- exceptions légales de conservation ;
- traçabilité des demandes.

Une suppression logique dans le système principal peut être propagée aux sauvegardes par expiration naturelle contrôlée plutôt que modification destructive de toutes les archives, selon la politique légale adoptée.

## 27. Inventaire des sauvegardes

Le portail opérations doit pouvoir présenter :

```text
Backup ID
service
base / bucket / ressource
environnement
heure début
heure fin
statut
point de restauration
région
chiffrement
rétention
immutabilité
checksum
dernier test de restauration
résultat du test
```

## 28. Alertes

Alertes minimales :

- sauvegarde échouée ;
- retard WAL/PITR ;
- sauvegarde trop ancienne ;
- réplication interrompue ;
- restauration de test échouée ;
- stockage de sauvegarde presque plein ;
- modification de politique de rétention ;
- suppression de sauvegarde ;
- accès inhabituel au coffre ;
- clé KMS indisponible.

## 29. Audit

Toute opération de sauvegarde ou restauration sensible doit enregistrer :

- acteur ;
- rôle ;
- date ;
- ressource ;
- environnement ;
- motif ;
- approbateur ;
- point restauré ;
- résultat ;
- contrôles effectués.

Les journaux d’audit doivent être protégés contre altération.

## 30. Portail d’administration

Menus recommandés :

```text
Operations
├── Backups
├── Restore points
├── Restore tests
├── Disaster Recovery
├── Business Continuity
├── Replication
├── Incidents
├── Runbooks
├── RPO / RTO
├── Providers
├── Audit
└── Reports
```

## 31. Permissions

Permissions recommandées :

```text
backup.read
backup.policy.manage
backup.run
restore.request
restore.approve
restore.execute
restore.verify
dr.failover.request
dr.failover.approve
dr.failover.execute
audit.read
```

`restore.execute` et `dr.failover.execute` ne doivent pas être accordées par défaut.

## 32. Métriques

KPIs :

- taux de succès sauvegardes ;
- âge du dernier backup valide ;
- couverture des ressources critiques ;
- durée moyenne de restauration ;
- RPO réellement observé ;
- RTO réellement observé ;
- taux de réussite des exercices ;
- écarts de rapprochement après reprise ;
- nombre de restaurations d’urgence ;
- incidents de rétention.

## 33. Exigences de recette

Avant mise en production d’un service Tier 0 ou Tier 1 :

- stratégie de sauvegarde définie ;
- rétention définie ;
- chiffrement validé ;
- restauration effectuée avec succès ;
- RPO mesuré ;
- RTO mesuré ;
- runbook disponible ;
- permissions testées ;
- rapprochement métier validé ;
- absence de secret en clair ;
- alertes opérationnelles actives.

## 34. Règle finale

Une sauvegarde Mansa n’est pas considérée opérationnelle parce qu’elle existe. Elle est considérée opérationnelle uniquement lorsqu’elle est récente, chiffrée, protégée, surveillée, restaurable et que la restauration a été testée avec succès.

Pour les domaines financiers, la reprise n’est terminée qu’après validation de cohérence du ledger, rapprochement des opérations externes et confirmation qu’aucun double débit ou double crédit ne peut être produit.
