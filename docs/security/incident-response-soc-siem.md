# Sécurité — SOC, SIEM, détection et réponse aux incidents Mansa

## 1. Objet

Ce document définit le dispositif opérationnel de détection, qualification, investigation, confinement, remédiation et retour d’expérience des incidents de sécurité Mansa.

Il complète les exigences déjà définies pour l’authentification, le RBAC, le DevSecOps, les secrets/KMS/HSM, l’observabilité, les sauvegardes, le PRA/PCA et la continuité de service. Il ne remplace aucun de ces dispositifs.

Le dispositif doit couvrir l’ensemble de l’écosystème :

- API et backend ;
- applications mobiles ;
- portails web ;
- TPE et terminaux ;
- bornes et contrôleurs de voie ;
- services État ;
- paiements, wallets et ledger ;
- agents et commerçants ;
- KYC/KYB ;
- infrastructures cloud et on-premise ;
- bases de données ;
- réseaux ;
- intégrations partenaires ;
- comptes privilégiés ;
- CI/CD ;
- postes d’administration ;
- services Jini et composants IA lorsqu’ils sont déployés.

## 2. Principes de référence

Le dispositif de sécurité opérationnelle respecte les principes suivants :

- défense en profondeur ;
- moindre privilège ;
- séparation des tâches ;
- journalisation centralisée ;
- horodatage fiable ;
- traçabilité des actions sensibles ;
- conservation des preuves ;
- automatisation contrôlée ;
- aucune suppression silencieuse d’un événement de sécurité ;
- aucune décision critique fondée uniquement sur le client mobile ou web ;
- fonctionnement dégradé sûr lorsque le réseau ou un service central est indisponible ;
- respect de la confidentialité et minimisation des données collectées.

## 3. Architecture SOC / SIEM

Architecture de référence :

```text
Applications / API / DB / Cloud / TPE / Bornes / Réseau / CI-CD
                ↓
       Collecteurs / agents / webhooks
                ↓
      Pipeline de logs sécurisé
                ↓
       Normalisation / enrichissement
                ↓
              SIEM
        ↙       ↓        ↘
Corrélation   Alertes   Recherche
        ↓       ↓        ↓
              SOC
                ↓
   Investigation / réponse / audit
```

Le SIEM doit rester remplaçable. Les producteurs d’événements ne doivent pas dépendre d’un fournisseur unique.

## 4. Sources de télémétrie minimales

Les sources suivantes doivent pouvoir alimenter le dispositif :

- logs d’authentification ;
- créations, rotations et révocations de sessions ;
- échecs MFA ;
- changements de mot de passe ou facteur ;
- événements RBAC ;
- création/modification de rôles et permissions ;
- accès administrateur et super-admin ;
- accès aux secrets/KMS/HSM ;
- opérations wallet/ledger ;
- paiements, remboursements et annulations ;
- changement de coordonnées bénéficiaires ;
- création et activation de cartes ;
- changements KYC/KYB ;
- opérations agent espèces ;
- transactions inhabituelles ;
- appels API sensibles ;
- erreurs applicatives ;
- modifications d’infrastructure ;
- logs de pare-feu/WAF/API gateway ;
- événements Kubernetes/containers si utilisés ;
- logs CI/CD ;
- scans GitGuardian, Snyk, Semgrep et outils équivalents ;
- activités des bornes, TPE et contrôleurs de voie ;
- ouvertures manuelles de barrières ;
- changements de configuration Mobile Money ou moyens de paiement ;
- événements ANPR/RFID strictement nécessaires à la sécurité opérationnelle ;
- actions d’administration État/concessionnaire ;
- anomalies de synchronisation hors ligne.

## 5. Schéma d’événement normalisé

Chaque événement de sécurité doit contenir, lorsque pertinent :

```text
event_id
event_type
occurred_at
received_at
environment
service
organization_id
tenant_id
country_code
user_id
actor_type
actor_id
session_id
role_ids
source_ip
device_id
terminal_id
site_id
lane_id
resource_type
resource_id
action
result
risk_score
correlation_id
trace_id
metadata_safe
```

Les champs secrets, PIN, CVV, PAN complet, tokens bruts, mots de passe, clés privées et données d’authentification sensibles ne doivent jamais être journalisés.

## 6. Intégrité et transport des logs

Les logs de sécurité doivent être :

- transmis via canal chiffré ;
- protégés contre l’altération ;
- tamponnés localement de façon limitée en cas de coupure ;
- retransmis après reprise ;
- dédupliqués ;
- associés à un horodatage cohérent ;
- conservés conformément aux politiques de rétention ;
- séparés des logs applicatifs non sensibles lorsque nécessaire.

Les journaux critiques doivent pouvoir utiliser un stockage append-only ou immuable selon le niveau de risque.

## 7. Niveaux de sévérité

Classification minimale :

```text
SEV0_CRITICAL
SEV1_HIGH
SEV2_MEDIUM
SEV3_LOW
SEV4_INFO
```

Exemples :

- `SEV0` : compromission confirmée de clés de production, fraude financière active majeure, accès super-admin non autorisé, altération du ledger, exfiltration de données réglementées ;
- `SEV1` : compromission probable d’un compte privilégié, attaque active avec impact limité, ransomware détecté mais contenu ;
- `SEV2` : tentative répétée crédible, comportement anormal nécessitant investigation ;
- `SEV3` : événement isolé faible risque ;
- `SEV4` : signal informatif conservé pour corrélation.

## 8. Détection d’authentification compromise

Le moteur doit détecter notamment :

- séries d’échecs d’authentification ;
- credential stuffing ;
- brute force ;
- connexion depuis un contexte inhabituel ;
- changement brusque de pays ou appareil ;
- session utilisée simultanément de façon incohérente ;
- refresh token réutilisé après rotation ;
- MFA désactivé puis opération sensible ;
- tentative d’accès à un compte suspendu ;
- usage anormal d’un compte privilégié.

Les règles géographiques ne doivent pas bloquer automatiquement un utilisateur légitime sans politique explicite et mécanisme de récupération.

## 9. Détection financière

Le SOC complète, sans remplacer, le moteur fraude métier.

Signaux possibles :

- multiplication anormale de transactions ;
- montants ou fréquences inhabituels ;
- doubles traitements ;
- séquences de remboursement atypiques ;
- modification de bénéficiaire suivie d’un transfert important ;
- compte administratif opérant sur plusieurs tenants sans justification ;
- manipulation de tarifs ou commissions ;
- écarts répétitifs de caisse ;
- ouvertures de barrière sans transaction ni abonnement valide ;
- altération ou tentative d’altération d’un journal financier ;
- divergence entre événement métier et ledger.

Le SIEM ne modifie jamais directement le ledger.

## 10. Détection multi-tenant

Alertes obligatoires pour :

- lecture d’une ressource d’un autre tenant sans permission ;
- écriture inter-tenant inattendue ;
- export massif traversant plusieurs organisations ;
- utilisation d’un rôle global hors périmètre ;
- augmentation soudaine de permissions ;
- changement de `tenant_id` ou `organization_id` incohérent avec la session.

## 11. Détection CI/CD et supply chain

Le dispositif doit corréler :

- secret détecté dans Git ;
- dépendance critique ;
- modification d’un workflow CI ;
- nouvelle GitHub Action non approuvée ;
- changement de provenance d’un package ;
- désactivation d’un test sécurité ;
- bypass d’une protection de branche ;
- publication d’un artefact non signé ou non attendu ;
- modification d’une image de conteneur ;
- changement d’IaC sensible.

Un agent IA ne doit pas pouvoir supprimer ou neutraliser silencieusement un contrôle de sécurité pour faire passer une pipeline.

## 12. Détection bornes, TPE et péages

Pour les équipements terrain :

- terminal déconnecté anormalement ;
- changement de firmware inattendu ;
- périphérique remplacé sans procédure ;
- ouverture du coffre ou cassette hors session autorisée ;
- ouverture manuelle de barrière ;
- incohérence véhicule/catégorie/tarif/paiement/ouverture/passage ;
- transaction hors ligne dépassant un plafond ;
- resynchronisation produisant des doublons ;
- lecteur RFID ou ANPR générant des événements incohérents ;
- changement de configuration de moyens de paiement ;
- tentative d’accès local au contrôleur.

### Exigences de référence péage

Deux solutions doivent coexister :

- solution A : péage automatique classique avec barrière ;
- solution B : télépéage RFID UHF passif avec barrière.

Une évolution future vers du free-flow sans barrière reste optionnelle et ne remplace pas ces deux solutions.

Le péage classique peut accepter, selon les canaux activés : billets et pièces FCFA/XOF, carte EMV multi-réseaux, NFC, carte Mansa, wallet Mansa, QR et Mobile Money.

Mobile Money reste activable/désactivable par l’administration au niveau national, réseau, poste ou voie, avec date d’effet et audit.

Le télépéage initial conserve : tag UHF RFID passif associé à un véhicule et à un compte, lecteur/antenne, contrôleur local, relais `OPEN`, barrière et capteurs de passage.

Le matériel reste multi-fournisseurs derrière des adaptateurs, avec relais/contact sec ou interface industrielle documentée.

Le système doit supporter : voie automatique complète, voie semi-automatique avec gestion sécurisée des espèces et poste numérisé à faible coût, avec déploiement progressif.

Mansa doit supporter le matériel acheté directement par l’État/concessionnaire ou fourni/intégré/revendu par Mansa, ainsi qu’une personnalisation marque blanche avec mention facultative `Propulsé par Mansa`.

Toute ouverture manuelle reste auditée.

## 13. Playbooks de réponse

Playbooks minimaux :

```text
ACCOUNT_TAKEOVER
PRIVILEGED_ACCOUNT_COMPROMISE
SECRET_EXPOSURE
API_ATTACK
DATA_EXFILTRATION
MALWARE_OR_RANSOMWARE
PAYMENT_FRAUD
LEDGER_INTEGRITY_ALERT
TENANT_ISOLATION_BREACH
KMS_HSM_INCIDENT
CI_CD_COMPROMISE
TERMINAL_COMPROMISE
TOLL_LANE_SECURITY_INCIDENT
PARTNER_BREACH
DENIAL_OF_SERVICE
INSIDER_THREAT
```

Chaque playbook précise :

- déclencheur ;
- propriétaire ;
- niveau de sévérité ;
- actions automatiques autorisées ;
- actions nécessitant approbation ;
- collecte de preuves ;
- confinement ;
- critères de reprise ;
- communication ;
- clôture ;
- retour d’expérience.

## 14. Actions automatiques autorisées

Selon le risque et la politique :

- révoquer une session ;
- forcer une nouvelle authentification ;
- bloquer temporairement un token ;
- désactiver une clé compromise ;
- isoler un terminal ;
- désactiver un compte technique ;
- bloquer une IP ou signature au WAF ;
- suspendre une intégration partenaire ;
- augmenter temporairement le niveau de contrôle ;
- passer un composant en mode lecture seule ;
- désactiver un moyen de paiement sur une voie précise lorsque nécessaire à la sécurité.

Les actions automatiques pouvant affecter des fonds, modifier le ledger, fermer un service national ou bloquer massivement des utilisateurs exigent une politique explicite et, lorsque requis, une validation humaine.

## 15. Confinement d’un compte compromis

Processus type :

1. marquer le compte comme suspect ;
2. révoquer les sessions concernées ;
3. invalider les refresh tokens ;
4. suspendre les opérations sensibles si politique applicable ;
5. protéger les bénéficiaires et moyens de paiement ;
6. imposer récupération d’identité ;
7. analyser les actions précédentes ;
8. restaurer progressivement les droits ;
9. conserver l’audit.

## 16. Incident de secret ou clé

En cas de secret exposé :

1. considérer le secret compromis ;
2. identifier son périmètre ;
3. révoquer/faire tourner le secret ;
4. rechercher son utilisation ;
5. vérifier les logs ;
6. remplacer les références ;
7. nettoyer l’historique uniquement selon procédure approuvée, sans considérer cela comme une révocation ;
8. documenter l’incident.

Pour une clé KMS/HSM, les procédures du cahier des charges KMS/HSM s’appliquent en priorité.

## 17. Chaîne de conservation des preuves

Les éléments utilisés pour une investigation doivent pouvoir enregistrer :

- identifiant de preuve ;
- origine ;
- collecteur ;
- date/heure ;
- hash ;
- stockage ;
- accès ;
- copies ;
- export ;
- destruction à échéance.

L’accès aux preuves est limité aux rôles autorisés.

## 18. Horodatage

Les systèmes critiques doivent utiliser une source de temps fiable. Les écarts d’horloge doivent être surveillés car ils peuvent fausser :

- l’ordre des événements ;
- les expirations de token ;
- les signatures ;
- le rapprochement financier ;
- la reconstruction d’incident.

## 19. Gestion des alertes

États recommandés :

```text
NEW
ACKNOWLEDGED
INVESTIGATING
CONTAINED
REMEDIATING
MONITORING
RESOLVED
FALSE_POSITIVE
CLOSED
```

Chaque changement d’état conserve :

- auteur ;
- horodatage ;
- motif ;
- commentaire ;
- pièces ou références associées.

## 20. Dossiers d’incident

Entités recommandées :

```text
SecurityAlert
SecurityIncident
IncidentTimelineEvent
IncidentEvidence
IncidentAction
IncidentAssignee
IncidentCommunication
IncidentRootCause
IncidentPostmortem
DetectionRule
DetectionRuleVersion
SuppressionRule
ThreatIndicator
```

## 21. Faux positifs et exceptions

Une alerte peut être classée faux positif mais :

- le signal original reste conservé ;
- la justification est enregistrée ;
- une exception doit être limitée dans le temps ;
- toute suppression de règle doit être versionnée ;
- aucune exception globale permanente ne doit être créée uniquement pour faire disparaître du bruit.

## 22. Threat intelligence

Le système peut ingérer des indicateurs externes :

- IP malveillantes ;
- domaines ;
- empreintes de fichiers ;
- signatures ;
- campagnes connues ;
- indicateurs partenaires.

Ces données servent d’enrichissement et ne doivent pas être considérées comme une preuve suffisante à elles seules.

## 23. Communication de crise

Pour les incidents importants, le plan doit prévoir :

- responsable incident ;
- responsable technique ;
- sécurité ;
- juridique/conformité ;
- direction ;
- relation partenaire ;
- communication client ;
- communication institutionnelle si nécessaire.

Aucune communication publique automatique par une IA n’est autorisée sans validation prévue par la gouvernance.

## 24. Notifications réglementaires et contractuelles

Les délais et destinataires dépendent du pays, de la nature des données, du statut réglementaire de Mansa et des contrats applicables.

Le système doit donc permettre de configurer :

- juridiction ;
- type d’incident ;
- obligations potentielles ;
- délais ;
- responsable ;
- preuve de notification ;
- validation juridique.

Les délais ne doivent pas être codés en dur sans base juridique validée.

## 25. Reprise de service

La reprise après incident exige :

- cause contenue ;
- accès compromis révoqué ;
- vulnérabilité corrigée ou compensée ;
- intégrité vérifiée ;
- données et ledger rapprochés si concernés ;
- secrets renouvelés si nécessaire ;
- monitoring renforcé temporaire ;
- validation du responsable compétent.

Le PRA/PCA reste la référence pour les scénarios de sinistre et restauration d’infrastructure.

## 26. Postmortem

Tout incident majeur doit produire un retour d’expérience sans suppression de l’historique :

- résumé ;
- chronologie ;
- impact ;
- détection ;
- cause racine ;
- facteurs contributifs ;
- actions de confinement ;
- actions correctives ;
- actions préventives ;
- responsables ;
- échéances ;
- vérification de fermeture.

## 27. Tests et exercices

Le dispositif doit être testé par :

- tests unitaires des règles critiques ;
- simulation d’alertes ;
- exercices tabletop ;
- simulation de secret compromis ;
- simulation de compte admin compromis ;
- exercice de fraude paiement ;
- exercice de perte de connectivité ;
- exercice terminal/borne compromis ;
- test PRA/PCA coordonné ;
- revue périodique des playbooks.

## 28. KPI et SLO sécurité

Indicateurs possibles :

- MTTD ;
- MTTA ;
- MTTC ;
- MTTR ;
- taux de faux positifs ;
- incidents par sévérité ;
- couverture des sources de logs ;
- taux de playbooks testés ;
- temps de révocation d’un secret ;
- temps de révocation d’une session compromise ;
- pourcentage d’alertes clôturées avec cause documentée.

Les objectifs sont configurables et revus selon la maturité opérationnelle.

## 29. Confidentialité et rétention

La collecte SOC doit rester proportionnée. Les journaux ne doivent pas devenir une copie illimitée de toutes les données métier.

Les politiques de rétention sont configurables selon :

- type de log ;
- risque ;
- réglementation ;
- contrat ;
- besoin d’audit ;
- coût ;
- nécessité d’enquête.

## 30. Accès au SOC

Rôles recommandés :

```text
SOC_ANALYST_L1
SOC_ANALYST_L2
SOC_ANALYST_L3
INCIDENT_COMMANDER
SECURITY_ENGINEER
FORENSICS_ANALYST
SECURITY_ADMIN
AUDITOR
READ_ONLY_SECURITY
```

Les rôles SOC ne doivent pas recevoir automatiquement des droits financiers ou super-admin applicatifs.

## 31. Séparation des environnements

Les données et alertes `dev`, `test`, `staging` et `production` doivent être identifiables clairement.

Les simulations de sécurité ne doivent pas provoquer involontairement de blocage production.

## 32. Intégrations

Le SOC peut s’intégrer avec :

- SIEM ;
- SOAR ;
- ticketing ;
- messagerie d’astreinte ;
- WAF ;
- IAM ;
- KMS/HSM ;
- EDR ;
- cloud security ;
- GitHub ;
- outils DevSecOps ;
- observabilité ;
- antifraude ;
- gestion des terminaux.

Toutes les intégrations utilisent des comptes de service à privilèges minimaux et des secrets gérés hors Git.

## 33. Mode dégradé et coupure réseau

Les sites terrain doivent pouvoir continuer selon une politique locale limitée lorsque le SIEM/SOC ou le cloud est indisponible.

Les événements sont tamponnés puis resynchronisés sans double traitement.

Pour les péages, la sécurité locale ne doit pas supprimer les exigences de base : contrôle du passage, audit des ouvertures manuelles, rapprochement ultérieur et absence de double débit.

## 34. Gouvernance des règles de détection

Chaque règle possède :

- identifiant ;
- version ;
- description ;
- source ;
- logique ;
- sévérité ;
- propriétaire ;
- date d’effet ;
- tests ;
- taux de faux positifs ;
- statut ;
- historique de modification.

États :

```text
DRAFT
TESTING
ACTIVE
TUNING
DISABLED
DEPRECATED
```

La désactivation d’une règle critique exige justification et audit.

## 35. Critères de maturité

### Niveau 1

- centralisation des logs critiques ;
- alertes d’authentification ;
- alertes privilèges ;
- alertes paiement ;
- procédure incident ;
- astreinte définie.

### Niveau 2

- corrélation multi-sources ;
- playbooks ;
- SIEM structuré ;
- alertes bornes/TPE ;
- exercices réguliers.

### Niveau 3

- SOAR contrôlé ;
- threat intelligence ;
- détection comportementale ;
- couverture multi-pays ;
- métriques SLO sécurité ;
- amélioration continue basée sur les postmortems.

## 36. Exigence finale

La sécurité Mansa ne doit pas reposer sur l’idée qu’une seule couche empêchera toute attaque.

Le système doit partir du principe qu’un composant, un compte, un terminal ou un partenaire peut être compromis, et disposer des moyens de détecter l’anomalie, limiter son rayon d’impact, conserver les preuves, restaurer un état sûr et empêcher la répétition du même scénario.
