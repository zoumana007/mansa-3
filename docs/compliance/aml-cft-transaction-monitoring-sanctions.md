# Conformité — AML/CFT, surveillance transactionnelle, sanctions et PPE

## 1. Objet

Ce document définit le moteur transversal Mansa de lutte contre le blanchiment de capitaux et le financement du terrorisme (AML/CFT), de surveillance transactionnelle, de filtrage sanctions, de gestion des personnes politiquement exposées (PPE/PEP), d’investigation et d’escalade conformité.

Le moteur doit pouvoir être utilisé par les produits Mansa concernés par des mouvements de valeur ou des opérations réglementées :

- wallet ;
- transferts P2P ;
- paiements marchands ;
- cartes ;
- agents cash-in/cash-out ;
- Mobile Money ;
- virements et partenaires bancaires ;
- paiements administratifs ;
- services État ;
- change et transferts internationaux ;
- crédit, épargne ou autres produits lorsqu’ils deviennent soumis à ces contrôles ;
- API partenaires.

Le moteur ne remplace pas le jugement du responsable conformité. Il fournit des contrôles, scores, alertes, dossiers et preuves auditables.

## 2. Principes de conception

Le système doit respecter les principes suivants :

- approche fondée sur le risque ;
- règles configurables par pays, entité juridique, produit, canal, segment, rôle et niveau KYC ;
- aucune liste de sanctions ou seuil réglementaire sensible codé en dur dans l’application ;
- séparation entre détection automatique et décision humaine ;
- traçabilité complète des décisions ;
- minimisation de l’accès aux données sensibles ;
- conservation configurable selon la politique applicable ;
- possibilité de versionner les règles et de connaître la règle exacte ayant déclenché une alerte ;
- absence de suppression silencieuse des alertes ou dossiers ;
- capacité à fonctionner avec plusieurs fournisseurs de données externes derrière des adaptateurs.

## 3. Architecture fonctionnelle

Chaîne générale :

```text
Événement utilisateur / transaction / changement KYC
→ normalisation
→ enrichissement client + compte + appareil + bénéficiaire + géographie + historique
→ screening sanctions/PPE si applicable
→ règles transactionnelles
→ scoring risque
→ décision temps réel ou post-transaction
→ autoriser / renforcer contrôle / retenir si juridiquement permis / refuser / alerter
→ dossier conformité
→ investigation
→ décision et audit
```

Le moteur doit distinguer les décisions strictement requises avant exécution de celles pouvant être réalisées après transaction.

## 4. Modèle de risque client

Chaque client ou organisation peut recevoir un profil de risque configurable basé sur des facteurs tels que :

- type de client : particulier, commerçant, agent, entreprise, administration, partenaire ;
- pays de résidence ;
- nationalité lorsque légalement pertinente ;
- activité professionnelle ou secteur ;
- type d’entreprise ;
- niveau et statut KYC/KYB ;
- ancienneté du compte ;
- volume habituel ;
- fréquence habituelle ;
- canaux utilisés ;
- appareils utilisés ;
- exposition géographique ;
- bénéficiaires ;
- activité cash ;
- statut PPE ;
- résultats sanctions ;
- alertes antérieures ;
- dossiers conformité ;
- événements de fraude lorsque leur réutilisation est autorisée par la politique.

Classes recommandées :

```text
LOW
STANDARD
ELEVATED
HIGH
RESTRICTED
```

Les seuils et actions attachés à ces classes restent configurables.

## 5. Screening sanctions

Le système doit permettre le filtrage des personnes physiques et morales contre une ou plusieurs sources de sanctions autorisées par l’entité réglementée.

Les fournisseurs sont intégrés derrière une abstraction :

```text
SanctionsScreeningProvider
```

Chaque screening doit enregistrer :

- personne ou organisation contrôlée ;
- source ou fournisseur ;
- version/date du dataset lorsque disponible ;
- date et heure du screening ;
- nom utilisé ;
- alias éventuels ;
- score ou niveau de correspondance ;
- éléments concordants ;
- statut de la revue ;
- décision ;
- auteur ;
- justification.

Une simple similarité de nom ne doit pas être considérée automatiquement comme une correspondance certaine.

## 6. PPE / PEP

Le système doit pouvoir identifier et gérer les personnes politiquement exposées selon la politique de l’organisation.

Statuts minimaux :

```text
NOT_IDENTIFIED
POTENTIAL_MATCH
CONFIRMED_PEP
FORMER_PEP
RELATED_OR_ASSOCIATED_PERSON
CLEARED_FALSE_POSITIVE
```

Une PPE ne doit pas être automatiquement traitée comme une personne interdite. La plateforme applique les mesures renforcées configurées par la conformité : revue, approbation, source des fonds, surveillance renforcée ou autre contrôle.

## 7. Re-screening continu

Les clients et bénéficiaires concernés doivent pouvoir être re-screenés :

- périodiquement ;
- lors d’une mise à jour de données d’identité ;
- lorsqu’une liste externe change ;
- lors d’un changement significatif de profil ;
- avant certaines opérations sensibles ;
- à la demande de la conformité.

Le système doit éviter de recréer inutilement le même faux positif déjà résolu lorsque les données pertinentes n’ont pas changé, tout en permettant de rouvrir un dossier si la source ou le profil évolue.

## 8. Surveillance transactionnelle

Le moteur de surveillance doit analyser au minimum :

- montant ;
- devise ;
- fréquence ;
- vitesse d’enchaînement ;
- cumul sur une fenêtre de temps ;
- origine et destination ;
- type de transaction ;
- produit ;
- canal ;
- bénéficiaire ;
- appareil ;
- localisation disponible et légitime ;
- agent ou commerçant impliqué ;
- historique du client ;
- niveau KYC ;
- profil de risque ;
- comportement attendu.

Les fenêtres peuvent être configurées : minute, heure, jour, semaine, mois ou période personnalisée.

## 9. Typologies de détection

Le moteur doit permettre de configurer des typologies telles que :

- structuration/fractionnement de transactions ;
- nombreux dépôts suivis d’un retrait rapide ;
- cash-in et cash-out anormalement rapprochés ;
- rotation rapide de fonds entre comptes ;
- usage inhabituel de plusieurs agents ;
- volumes incompatibles avec le profil déclaré ;
- nombreux bénéficiaires nouveaux en peu de temps ;
- réception de fonds de multiples comptes suivie d’un transfert consolidé ;
- activité dormante devenant soudainement intensive ;
- changement brutal de pays, appareil ou comportement ;
- schémas circulaires ;
- mouvements entre comptes fortement liés ;
- tentative répétée juste sous un seuil interne ;
- concentration anormale chez un agent ou commerçant ;
- transferts internationaux ou corridors nécessitant une surveillance renforcée selon la politique.

Ces typologies sont des capacités techniques et non des conclusions automatiques de blanchiment.

## 10. Règles et versioning

Une règle doit comporter :

- identifiant stable ;
- nom ;
- description ;
- propriétaire métier ;
- entité/pays ;
- produits concernés ;
- segment ;
- conditions ;
- fenêtres temporelles ;
- score ;
- action ;
- date d’effet ;
- date de fin facultative ;
- version ;
- statut ;
- auteur ;
- approbateur ;
- justification de modification.

États :

```text
DRAFT
TESTING
ACTIVE
SUSPENDED
RETIRED
```

Une nouvelle version ne doit pas modifier rétroactivement la justification d’une alerte historique.

## 11. Mode simulation et backtesting

Avant activation, une règle doit pouvoir être testée sur des données historiques ou synthétiques autorisées.

Le backtesting doit produire :

- nombre d’événements analysés ;
- nombre d’alertes ;
- taux d’alerte ;
- distribution par segment ;
- comparaison avec la règle précédente ;
- faux positifs connus lorsque disponibles ;
- estimation de charge pour les analystes ;
- exemples anonymisés ou protégés.

Une règle ne doit pas être activée uniquement parce qu’elle détecte davantage d’événements.

## 12. Décisions temps réel

Les actions possibles sont configurables et juridiquement encadrées :

```text
ALLOW
ALLOW_AND_MONITOR
STEP_UP_KYC
REQUEST_ADDITIONAL_INFORMATION
MANUAL_REVIEW
DELAY_IF_PERMITTED
RESTRICT_IF_PERMITTED
REJECT_IF_REQUIRED
CREATE_ALERT
```

Mansa ne doit pas inventer un pouvoir de blocage. Les actions `DELAY`, `RESTRICT` ou `REJECT` sont disponibles uniquement lorsque la politique et le cadre applicable les autorisent.

## 13. Alertes AML

Une alerte doit contenir :

- identifiant ;
- client/organisation ;
- transaction(s) ;
- règle(s) déclenchée(s) ;
- score ;
- facteurs explicatifs ;
- historique pertinent ;
- date de création ;
- priorité ;
- statut ;
- analyste assigné ;
- SLA interne ;
- preuves/liens associés ;
- journal d’actions.

Statuts recommandés :

```text
NEW
TRIAGE
UNDER_REVIEW
ESCALATED
AWAITING_INFORMATION
CLOSED_FALSE_POSITIVE
CLOSED_NO_ACTION
CLOSED_ACTION_TAKEN
```

## 14. Déduplication et regroupement

Le moteur doit éviter qu’un même comportement génère des centaines d’alertes isolées inutiles.

Il doit pouvoir :

- regrouper les alertes par client ;
- regrouper par période ;
- regrouper par typologie ;
- rattacher plusieurs transactions à une même alerte ;
- fusionner des alertes selon des règles contrôlées ;
- conserver l’origine de chaque déclenchement même après regroupement.

## 15. Case management conformité

Une ou plusieurs alertes peuvent être transformées en dossier.

Entité recommandée :

```text
ComplianceCase
```

Le dossier contient :

- sujet ;
- personnes/organisations liées ;
- comptes ;
- wallets ;
- appareils ;
- bénéficiaires ;
- transactions ;
- alertes ;
- documents ;
- notes ;
- tâches ;
- décisions ;
- approbations ;
- chronologie ;
- niveau de confidentialité ;
- statut ;
- responsable.

## 16. Investigation

L’interface analyste doit permettre :

- vue chronologique des transactions ;
- graphe de relations ;
- comparaison au comportement historique ;
- recherche de comptes, bénéficiaires, appareils et agents liés ;
- filtrage par période et type ;
- consultation KYC/KYB selon permissions ;
- consultation du screening ;
- ajout de notes ;
- demande d’informations ;
- escalade ;
- décision documentée.

Les données ne doivent être visibles qu’aux rôles autorisés.

## 17. Graphe relationnel

Le moteur peut construire des relations entre :

```text
Person
Organization
Account
Wallet
Card
Phone
Device
Beneficiary
Merchant
Agent
BankAccount
Transaction
Address
IdentityDocument
```

Chaque lien doit indiquer son origine et son niveau de confiance. Une corrélation technique ne doit pas être présentée comme une relation certaine sans preuve suffisante.

## 18. Source des fonds et source du patrimoine

Selon le niveau de risque ou le produit, la plateforme doit pouvoir demander et enregistrer :

- origine déclarée des fonds ;
- source du patrimoine lorsque nécessaire ;
- justificatifs ;
- date ;
- statut de revue ;
- analyste ;
- décision ;
- échéance de renouvellement éventuelle.

Les pièces sont stockées avec chiffrement, contrôle d’accès et politique de rétention.

## 19. Demandes d’informations

Le moteur doit permettre de demander au client ou à une équipe interne des informations complémentaires sans exposer la logique interne de détection.

États :

```text
REQUESTED
DELIVERED
UNDER_REVIEW
ACCEPTED
REJECTED
EXPIRED
```

Toute demande doit être traçable.

## 20. Séparation des tâches

Les rôles recommandés sont :

```text
AML_ANALYST
AML_SENIOR_ANALYST
AML_MANAGER
COMPLIANCE_OFFICER
AUDITOR
SYSTEM_ADMIN
```

Les pouvoirs doivent être séparables :

- créer/modifier une règle ;
- approuver une règle ;
- analyser une alerte ;
- clôturer ;
- escalader ;
- appliquer une restriction ;
- exporter ;
- consulter les données sensibles ;
- administrer les fournisseurs.

Un administrateur technique ne doit pas obtenir automatiquement un droit métier de clôture d’un dossier AML.

## 21. Gestion des faux positifs

Lorsqu’une alerte est classée faux positif, le système doit enregistrer :

- motif ;
- preuves ;
- analyste ;
- approbation si requise ;
- date ;
- règle concernée ;
- possibilité d’utiliser cette information pour tuning.

La fermeture d’un faux positif ne doit pas effacer l’historique.

## 22. Tuning et qualité des règles

Indicateurs recommandés :

- alertes par règle ;
- alertes par 1 000 transactions ;
- proportion clôturée faux positif ;
- proportion escaladée ;
- délai moyen de traitement ;
- backlog ;
- récurrence client ;
- charge par analyste ;
- règles silencieuses ;
- règles excessivement bruyantes.

Les modifications de tuning sont versionnées et approuvées.

## 23. Détection de contournement

Le moteur doit surveiller les comportements destinés à contourner les limites internes :

- fractionnement sur plusieurs comptes ;
- fractionnement sur plusieurs agents ;
- usage de plusieurs bénéficiaires ;
- rotation d’appareils ;
- changement fréquent de moyens de financement ;
- chaînes de transferts rapides ;
- activité coordonnée entre comptes liés.

Les corrélations doivent être expliquables et révisables.

## 24. Agents et commerçants

Pour le réseau agents et marchands, le moteur doit pouvoir détecter :

- volumes anormaux ;
- concentration inhabituelle ;
- dépôts/retraits artificiellement équilibrés ;
- nombreux comptes nouveaux liés au même appareil ou opérateur ;
- annulations ou reversals atypiques ;
- écarts fréquents ;
- utilisation hors zone autorisée lorsque ce contrôle est applicable ;
- schémas coordonnés avec certains clients.

Une alerte sur un agent n’entraîne pas automatiquement sa suspension sans politique explicite.

## 25. Comptes et appareils liés

Le moteur peut utiliser des signaux tels que :

- identifiant appareil ;
- téléphone ;
- adresse ;
- bénéficiaire ;
- compte bancaire ;
- carte ;
- document ;
- IP lorsque sa collecte est légitime ;
- géolocalisation lorsque autorisée et nécessaire.

L’utilisation de ces signaux doit respecter les politiques de confidentialité et de minimisation des données Mansa.

## 26. API partenaires

Les partenaires peuvent transmettre des événements AML pertinents via API ou webhook.

Exemples :

- paiement autorisé/refusé ;
- chargeback ;
- dépôt ;
- retrait ;
- transfert ;
- changement KYC ;
- résultat screening ;
- blocage externe.

Chaque événement doit être authentifié, idempotent, horodaté et rattaché à sa source.

## 27. Multi-fournisseurs

Interfaces recommandées :

```text
SanctionsScreeningProvider
PepScreeningProvider
AdverseMediaProvider
TransactionMonitoringDataProvider
CaseExportProvider
```

Mansa doit pouvoir changer de fournisseur ou combiner plusieurs sources sans réécrire les règles métier centrales.

## 28. Médias défavorables / adverse media

Si cette fonctionnalité est activée, les résultats de médias défavorables doivent être traités comme des signaux à vérifier, jamais comme une preuve automatique.

Le système conserve : source, date, lien ou référence, catégorie, score fournisseur, statut de revue et décision humaine.

## 29. Confidentialité des investigations

Les dossiers AML peuvent contenir des informations hautement sensibles.

Exigences :

- RBAC strict ;
- journalisation des consultations ;
- chiffrement ;
- masquage des données selon rôle ;
- export limité ;
- aucune donnée AML détaillée dans les logs techniques ordinaires ;
- aucune notification utilisateur révélant l’existence d’une investigation interne sauf processus explicitement autorisé.

## 30. Audit immuable

Les événements suivants doivent être auditables :

- création/modification/activation de règle ;
- résultat de screening ;
- déclenchement d’alerte ;
- consultation d’un dossier sensible ;
- assignation ;
- note ;
- changement de statut ;
- demande d’information ;
- restriction ;
- levée de restriction ;
- clôture ;
- export ;
- changement fournisseur ;
- modification de seuil.

Le journal conserve acteur, action, date, avant/après lorsque pertinent et contexte.

## 31. Conservation et suppression

Les durées de conservation doivent être configurables par catégorie de donnée et juridiction.

Une demande standard de suppression de compte ne doit pas effacer automatiquement les éléments que l’entité doit ou est autorisée à conserver au titre de ses obligations de conformité. Le moteur Data Governance applique la politique de rétention et de base légale correspondante.

## 32. Export réglementaire et dossier de preuve

Le système doit pouvoir produire un paquet d’export contrôlé contenant, selon les permissions :

- identité du sujet ;
- synthèse ;
- chronologie ;
- transactions ;
- règles déclenchées ;
- résultats screening ;
- pièces ;
- notes approuvées ;
- décisions ;
- journal pertinent.

Le format exact des déclarations réglementaires reste adapté par pays et ne doit pas être codé comme universel.

## 33. Reporting conformité

Tableaux de bord :

- nombre d’alertes ;
- backlog ;
- SLA ;
- alertes par typologie ;
- alertes par produit ;
- alertes par segment ;
- cas escaladés ;
- faux positifs ;
- screenings en attente ;
- PPE ;
- correspondances sanctions ;
- règles les plus bruyantes ;
- capacité analystes.

Les tableaux agrégés respectent les droits d’accès.

## 34. Continuité de service

Une panne d’un fournisseur de screening doit être visible explicitement.

Politiques possibles selon produit et niveau de risque :

```text
FAIL_CLOSED
FAIL_OPEN_WITH_MONITORING
QUEUE_FOR_REVIEW
LIMITED_OPERATION
MANUAL_DECISION
```

Le choix est configuré par la conformité. Une panne ne doit pas être interprétée silencieusement comme un résultat négatif de screening.

## 35. Mode hors ligne

Pour les canaux fonctionnant hors ligne, seules les opérations explicitement autorisées par une politique de risque peuvent être exécutées.

Le contrôleur local peut appliquer des limites réduites et des listes de blocage/cache signées lorsque cela est prévu. Tous les événements sont resynchronisés de façon idempotente et réanalysés au retour du réseau.

Aucun mode hors ligne ne doit permettre de contourner durablement les contrôles AML centraux.

## 36. Tests obligatoires

Le module doit inclure des tests de :

- correspondance et faux positifs sanctions ;
- règles de vélocité ;
- fractionnement ;
- cumul multi-fenêtres ;
- multi-devises ;
- fuseaux horaires ;
- déduplication ;
- re-screening ;
- versioning ;
- RBAC ;
- isolation multi-tenant ;
- export ;
- indisponibilité fournisseur ;
- reprise après incident ;
- idempotence des événements ;
- absence de double décision financière.

## 37. Modèle de données minimal

Entités recommandées :

```text
CustomerRiskProfile
RiskFactor
RiskAssessment
ScreeningSubject
ScreeningRun
ScreeningMatch
ScreeningDecision
MonitoringRule
MonitoringRuleVersion
MonitoringScenario
MonitoringEvent
AmlAlert
AmlAlertTransaction
ComplianceCase
ComplianceCaseSubject
ComplianceCaseRelation
ComplianceCaseNote
ComplianceCaseTask
ComplianceDecision
InformationRequest
RestrictionAction
ComplianceAuditLog
```

Toutes les entités sont isolées par organisation/tenant lorsque pertinent.

## 38. Portail conformité

Menus recommandés :

```text
Conformité AML
├── Tableau de bord
├── Alertes
├── Dossiers
├── Screening
│   ├── Sanctions
│   ├── PPE
│   └── Autres sources
├── Surveillance transactionnelle
│   ├── Règles
│   ├── Scénarios
│   ├── Backtesting
│   └── Tuning
├── Profils de risque
├── Demandes d’informations
├── Restrictions
├── Fournisseurs
├── Reporting
├── Exports
└── Audit
```

## 39. IA et aide à l’analyste

Une IA peut aider à :

- résumer une chronologie ;
- regrouper les faits ;
- expliquer pourquoi une règle a déclenché ;
- préparer une liste de points à vérifier ;
- rechercher des relations dans les données autorisées ;
- proposer un brouillon de note.

Elle ne doit pas prendre seule une décision finale sensible de conformité lorsque cette décision nécessite une validation humaine ou réglementaire. Les sorties IA sont identifiées comme telles et auditables.

## 40. Exigence finale

Le moteur AML/CFT doit être transversal, explicable, versionné, auditable, multi-fournisseurs et configurable. Il doit permettre à Mansa de faire évoluer ses règles avec ses partenaires et obligations sans réécrire les applications clientes, tout en évitant de transformer des signaux statistiques en accusations automatiques.
