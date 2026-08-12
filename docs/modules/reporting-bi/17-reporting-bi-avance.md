# 17 — Reporting & BI avancé

## 1. Objectif

Le module **Reporting & BI avancé** fournit à MANSA une couche transverse de pilotage, d’analyse, de restitution, de contrôle et d’aide à la décision couvrant les activités client, commerçant, agent, entreprise, partenaire, État, finance, conformité, risque, support et opérations.

Il ne doit jamais devenir une seconde source de vérité financière. Les soldes, mouvements, frais, commissions, taxes, revenus, investissements, crédits, assurances, opérations publiques ou autres données sensibles restent produits par leurs domaines respectifs. Le module BI consomme des événements, vues matérialisées, modèles analytiques ou snapshots versionnés et doit toujours permettre de remonter à la source opérationnelle autorisée.

Objectifs principaux :

- fournir des tableaux de bord temps réel, quasi temps réel et historiques ;
- consolider les KPI opérationnels, financiers, commerciaux, produits, risques et conformité ;
- permettre l’analyse par pays, entité, produit, canal, partenaire, segment, devise et période ;
- offrir des rapports standardisés et des rapports configurables sans déploiement de code ;
- assurer la traçabilité complète de chaque indicateur et de sa définition ;
- distinguer métriques opérationnelles, comptables, financières, réglementaires et marketing ;
- intégrer le moteur central de frais et commissions et conserver la version tarifaire réellement appliquée ;
- fournir exports, API, webhooks et livraisons programmées sécurisées ;
- respecter RBAC/ABAC, minimisation des données, secret statistique et contraintes de résidence ;
- fonctionner en multi-pays et multi-devises avec règles FX explicites ;
- éviter les incohérences entre dashboards, exports et rapports réglementaires ;
- fournir des contrôles de qualité, fraîcheur et complétude des données ;
- supporter la montée en charge sans dégrader les transactions métier.

---

## 2. Principes non négociables

1. Le système transactionnel reste la source de vérité ; la BI est une projection analytique contrôlée.
2. Toute métrique critique possède un propriétaire, une définition, une formule, une granularité, une source, une fréquence et une version.
3. Un indicateur financier ne doit jamais être recalculé à partir de données approximatives si une écriture comptable ou un `PricingSnapshot` existe.
4. Les frais, commissions et taxes historiques sont lus depuis les snapshots réellement appliqués à l’exécution, jamais depuis la règle tarifaire actuellement active.
5. Les corrections historiques sont versionnées et auditées ; aucun recalcul silencieux d’un rapport publié n’est autorisé.
6. Aucun utilisateur ne voit des données au-delà de ses droits de pays, entité, organisation, équipe, rôle, produit ou portefeuille.
7. Les données personnelles doivent être minimisées, pseudonymisées ou agrégées dès que l’usage ne nécessite pas l’identité.
8. Toute exportation sensible est autorisée, journalisée, limitée dans le temps et protégée.
9. Les environnements Démo, Recette et Production sont isolés.
10. Les datasets analytiques ne contiennent aucun secret, clé API ou credential partenaire.
11. Les dashboards critiques affichent la fraîcheur et le dernier instant de calcul réussi.
12. Toute donnée externe est qualifiée avec provenance, horodatage, disponibilité et niveau de confiance.
13. Les métriques réglementaires et financières doivent être reproductibles à une date donnée.
14. Les données multi-devises conservent montant et devise d’origine ; toute conversion est explicite, datée et versionnée.
15. Les règles locales de conservation, résidence, confidentialité et accès priment sur la commodité analytique.

---

## 3. Périmètre fonctionnel

### 3.1 Cockpit exécutif

Vue consolidée configurable comprenant notamment :

- utilisateurs inscrits, actifs, vérifiés et dormants ;
- nouveaux utilisateurs et taux d’activation ;
- volume et valeur des transactions ;
- TPV/GMV selon définition documentée ;
- revenus bruts, revenus nets, frais, commissions, taxes ;
- marge par produit, canal, segment et pays ;
- cash-in, cash-out, transferts, paiements, retraits ;
- nombre et valeur des opérations échouées, annulées, remboursées ou contestées ;
- activité commerçants, agents, partenaires et entreprises ;
- soldes agrégés lorsque juridiquement autorisés ;
- encours crédit, assurance, investissement et produits d’épargne lorsque disponibles ;
- exposition fraude/risque ;
- incidents, disponibilité et SLA ;
- tickets support et satisfaction ;
- indicateurs État/institutionnels autorisés ;
- comparaison jour/semaine/mois/trimestre/année ;
- objectifs, prévisions et écarts.

Chaque carte indique : valeur, unité, période, comparaison, définition, fraîcheur, source et éventuel avertissement qualité.

### 3.2 Reporting financier et revenus

Le module doit produire des vues sur :

- revenus par produit ;
- frais facturés ;
- commissions MANSA ;
- commissions agents ;
- commissions commerçants ;
- commissions partenaires ;
- commissions apporteurs ;
- taxes séparées ;
- gratuités et promotions ;
- remises commerciales ;
- remboursements et reprises ;
- chargebacks et pertes ;
- provisions et réserves ;
- coûts partenaires déclarés ou importés ;
- marge brute et marge contributive selon définition ;
- créances et dettes de règlement ;
- rapprochement et écarts ;
- positions par devise ;
- revenus réalisés vs estimés.

Aucun revenu ne doit être déduit par approximation si la transaction possède déjà un détail tarifaire historisé.

### 3.3 Reporting produit

Pour chaque module MANSA :

- acquisition ;
- activation ;
- adoption ;
- fréquence d’usage ;
- volume ;
- valeur ;
- taux de succès ;
- abandon ;
- rétention ;
- churn ;
- réactivation ;
- cohortes ;
- panier moyen ;
- temps de parcours ;
- funnels ;
- erreurs ;
- satisfaction ;
- revenu ;
- coût ;
- marge ;
- incidents ;
- couverture géographique.

Les modules futurs peuvent enregistrer leurs métriques via un contrat analytique commun plutôt que modifier le cœur BI.

### 3.4 Commerçants, agents et réseaux

Analyses :

- activité par commerçant/agent ;
- nombre de points actifs ;
- géographie ;
- volumes ;
- commissions ;
- disponibilité de liquidité si pertinent ;
- taux d’échec ;
- annulations ;
- concentration ;
- dépendance à quelques points ;
- croissance ;
- performance des réseaux ;
- incidents ;
- suspicion fraude ;
- qualité KYC/KYB ;
- SLA ;
- rentabilité.

Les données nominatives ne sont visibles que si nécessaires au rôle et à l’investigation.

### 3.5 Entreprises / B2B

Pour Mansa Entreprise :

- dépenses par entité, équipe, centre de coût et catégorie ;
- budgets consommés et restants ;
- paiements fournisseurs ;
- cartes et plafonds ;
- approbations ;
- délais de validation ;
- dépenses hors politique ;
- paiements de masse ;
- trésorerie ;
- multi-devises ;
- prévisions ;
- rapprochement ;
- performance des fournisseurs ;
- export comptable configuré.

### 3.6 Partenaires

Pour le programme partenaires :

- leads attribués ;
- conversions ;
- taux de conversion ;
- volumes admissibles ;
- commissions estimées/acquises/réservées/payées/reprises ;
- revenus générés ;
- coût d’acquisition ;
- fraude ;
- litiges ;
- SLA ;
- rentabilité par partenaire/programme ;
- concentration ;
- comparaison des cohortes.

### 3.7 État et institutions

Rapports configurables selon mandat :

- transactions de service public ;
- recettes collectées ;
- décaissements ;
- subventions ;
- bénéficiaires agrégés ;
- paiements fournisseurs ;
- rapprochement par organisme ;
- zones géographiques ;
- délais de traitement ;
- taux d’échec ;
- anomalies ;
- audit ;
- performance opérationnelle.

Aucun partage de données citoyennes au-delà du mandat et du besoin strict.

### 3.8 Risque, fraude et conformité

Tableaux de bord :

- alertes générées ;
- alertes en attente ;
- temps de traitement ;
- faux positifs ;
- cas confirmés ;
- pertes fraude ;
- montants bloqués ;
- comptes restreints ;
- couverture KYC/KYB ;
- revues périodiques ;
- sanctions/PEP selon fournisseurs autorisés ;
- règles ayant déclenché ;
- score de risque ;
- charge analystes ;
- SLA d’investigation ;
- déclarations réglementaires lorsque le cadre local l’exige.

La BI ne décide pas seule de bloquer une opération : elle expose, agrège et alimente les domaines de risque autorisés.

### 3.9 Support et opérations

- tickets entrants ;
- motifs ;
- temps première réponse ;
- temps résolution ;
- réouvertures ;
- escalades ;
- incidents ;
- bugs ;
- disponibilité services ;
- latences ;
- taux d’erreur ;
- partenaires dégradés ;
- opérations manuelles ;
- files d’attente ;
- backlog ;
- satisfaction ;
- qualité de service par pays/canal.

---

## 4. Rapports standards

Le produit fournit un catalogue versionné comprenant au minimum :

- rapport exécutif quotidien ;
- rapport activité transactionnelle ;
- rapport revenus/frais/commissions/taxes ;
- rapport règlements et rapprochement ;
- rapport liquidité ;
- rapport agents ;
- rapport commerçants ;
- rapport partenaires ;
- rapport entreprises ;
- rapport produit ;
- rapport fraude/risque ;
- rapport conformité ;
- rapport incidents/SLA ;
- rapport multi-devises ;
- rapport promotions/gratuités ;
- rapport anomalies de pricing ;
- rapport État/institutionnel selon autorisation ;
- rapport qualité des données.

Chaque rapport possède `ReportDefinition`, propriétaire, version, champs autorisés, filtres, sécurité, sources, fréquence, format, rétention et journal de publication.

---

## 5. Constructeur de rapports et dashboards

L’administration habilitée doit pouvoir configurer sans code :

- titre et description ;
- métriques certifiées ;
- dimensions ;
- filtres ;
- période ;
- comparaison ;
- segmentation ;
- tri ;
- agrégation ;
- visualisation ;
- seuils ;
- objectifs ;
- alertes ;
- destinataires ;
- fréquence ;
- formats d’export ;
- durée de conservation ;
- niveau de sensibilité ;
- périmètre pays/entité/organisation.

Le constructeur ne doit pas accepter du SQL arbitraire côté utilisateur final. Les requêtes reposent sur un catalogue sémantique ou DSL borné avec métriques et dimensions autorisées.

---

## 6. Moteur de frais et commissions — intégration obligatoire

Reporting & BI consomme le moteur transversal de pricing et commissions et doit rendre vérifiable son comportement.

L’administration peut configurer dans le moteur central, sans modification de code :

- frais fixes ;
- pourcentage ;
- fixe + pourcentage ;
- minimum ;
- maximum ;
- paliers ;
- gratuité ;
- nombre d’opérations gratuites ;
- promotions ;
- pays ;
- devise ;
- canal ;
- type d’utilisateur ;
- partenaire ;
- volume ;
- commission MANSA ;
- commission agent ;
- commission commerçant ;
- commission partenaire ;
- commission apporteur ;
- taxes séparées ;
- date d’effet ;
- date de fin ;
- simulation avant publication ;
- approbation des changements sensibles ;
- versioning tarifaire ;
- audit immuable.

Pour chaque transaction analysée, les faits BI référencent le `PricingSnapshot` ou équivalent figé comportant les frais et commissions effectivement appliqués à l’exécution.

Le module expose notamment :

- revenu par règle tarifaire ;
- coût de promotion ;
- taux de gratuité ;
- nombre d’opérations gratuites consommées ;
- revenu théorique vs revenu réalisé ;
- commissions par bénéficiaire ;
- taxes ;
- overrides ;
- règles arrivant à expiration ;
- variations avant/après changement tarifaire ;
- anomalies entre simulation et exécution ;
- transactions sans snapshot attendu ;
- conflits ou chevauchements de règles détectés.

Un rapport historique ne recalcule jamais les frais d’une transaction avec une version tarifaire actuelle.

---

## 7. Modèle analytique et données

### 7.1 MetricDefinition

- `id` ;
- `code` ;
- `name` ;
- `description` ;
- `domain` ;
- `ownerTeam` ;
- `unit` ;
- `aggregationType` ;
- `formulaRef` ;
- `sourceRefs[]` ;
- `dimensionsAllowed[]` ;
- `sensitivityLevel` ;
- `freshnessTarget` ;
- `version` ;
- `status` ;
- `effectiveFrom` ;
- `effectiveTo`.

### 7.2 DimensionDefinition

- `id` ; `code` ; `name` ; `domain` ; `dataType` ; `hierarchyRef` ; `sensitivityLevel` ; `allowedScopes` ; `version`.

### 7.3 Dashboard

- `id` ;
- `organizationId` optionnel ;
- `name` ;
- `scope` ;
- `ownerId` ;
- `visibility` ;
- `countryScopes[]` ;
- `entityScopes[]` ;
- `widgets[]` ;
- `defaultFilters` ;
- `status` ;
- `version`.

### 7.4 ReportDefinition

- `id` ; `code` ; `name` ; `reportType` ; `metricRefs[]` ; `dimensionRefs[]` ; `filtersSchema` ; `outputFormats[]` ; `securityPolicyId` ; `retentionPolicyId` ; `version` ; `status`.

### 7.5 ReportRun

- `id` ;
- `reportDefinitionId` ;
- `definitionVersion` ;
- `requestedBy` ;
- `parametersSnapshot` ;
- `dataCutoffAt` ;
- `startedAt` ;
- `completedAt` ;
- `status` ;
- `rowCount` ;
- `fileRef` optionnel ;
- `expiresAt` ;
- `checksum` ;
- `errorCode` optionnel.

### 7.6 ReportSchedule

- `id` ; `reportDefinitionId` ; `frequency` ; `timezone` ; `recipientsPolicyId` ; `format` ; `filtersSnapshot` ; `nextRunAt` ; `status`.

### 7.7 AnalyticalFactTransaction

Projection analytique sans remplacer la transaction source :

- `transactionId` ;
- `occurredAt` ;
- `settledAt` optionnel ;
- `countryCode` ;
- `entityId` ;
- `productType` ;
- `channel` ;
- `customerSegment` pseudonymisé ;
- `merchantRef` pseudonymisé si possible ;
- `agentRef` pseudonymisé si possible ;
- `partnerRef` pseudonymisé si possible ;
- `amountOriginal` ;
- `currencyOriginal` ;
- `status` ;
- `pricingSnapshotId` ;
- `mansaFee` ;
- `agentCommission` ;
- `merchantCommission` ;
- `partnerCommission` ;
- `referralCommission` ;
- `taxAmount` ;
- `promotionAmount` ;
- `ingestedAt` ;
- `sourceVersion`.

### 7.8 FXSnapshot

- `id` ; `baseCurrency` ; `quoteCurrency` ; `rate` ; `rateType` ; `sourceRef` ; `effectiveAt` ; `version`.

### 7.9 DataQualityResult

- `id` ; `ruleCode` ; `datasetRef` ; `checkedAt` ; `status` ; `affectedRows` ; `severity` ; `sampleRefs` minimisées ; `resolvedAt`.

### 7.10 DataLineage

- `id` ; `metricCode` ; `metricVersion` ; `sourceDataset` ; `sourceField` ; `transformationRef` ; `targetDataset` ; `targetField` ; `effectiveAt`.

---

## 8. États et statuts

### MetricDefinition
`DRAFT`, `REVIEW`, `APPROVED`, `ACTIVE`, `DEPRECATED`, `RETIRED`.

### Dashboard
`DRAFT`, `ACTIVE`, `ARCHIVED`.

### ReportDefinition
`DRAFT`, `PENDING_APPROVAL`, `ACTIVE`, `SUSPENDED`, `DEPRECATED`, `ARCHIVED`.

### ReportRun
`QUEUED`, `RUNNING`, `SUCCEEDED`, `PARTIALLY_SUCCEEDED`, `FAILED`, `CANCELLED`, `EXPIRED`.

### ReportSchedule
`DRAFT`, `ACTIVE`, `PAUSED`, `FAILED`, `EXPIRED`, `DISABLED`.

### DataQualityResult
`PASS`, `WARNING`, `FAIL`, `ACKNOWLEDGED`, `RESOLVED`.

Toute transition sensible est contrôlée par le domaine et auditée.

---

## 9. Règles métier et gouvernance des métriques

- une métrique critique doit être certifiée avant usage dans un rapport officiel ;
- une modification de formule crée une nouvelle version avec date d’effet ;
- les rapports déjà publiés conservent leur version de définition ;
- une métrique dépréciée reste lisible pour l’historique mais n’est plus proposée aux nouveaux rapports ;
- aucune division par zéro ou valeur manquante ne doit être convertie silencieusement en zéro ;
- `null`, zéro, inconnu et non applicable sont distincts ;
- les fuseaux horaires sont explicites ;
- les frontières de jour/mois sont définies par le fuseau métier du rapport ;
- les montants utilisent des types décimaux adaptés, jamais des flottants binaires ;
- les règles d’arrondi sont explicites par devise et type d’indicateur ;
- chaque conversion FX conserve le taux et la source utilisés ;
- les chiffres de reporting réglementaire sont gelables avec un `dataCutoffAt` ;
- les événements tardifs peuvent produire une révision versionnée, jamais modifier silencieusement un rapport figé ;
- toute suppression logique côté métier se propage selon la politique de conservation autorisée ;
- les données agrégées peuvent être conservées plus longtemps seulement si elles ne permettent pas de réidentifier indûment les personnes ;
- un dashboard ne doit pas contourner les politiques d’accès du domaine source.

---

## 10. Multi-pays et multi-devises

Le module doit permettre :

- filtrage et isolation par pays ;
- entités juridiques distinctes ;
- fuseaux horaires ;
- formats locaux ;
- calendriers et jours ouvrés configurables ;
- devises multiples ;
- langues d’interface ;
- définitions réglementaires locales ;
- règles de résidence ;
- périodes fiscales configurables ;
- TVA/taxes/levies locales abstraites ;
- regroupements régionaux autorisés.

Pour les consolidations multi-devises, conserver :

1. montant et devise d’origine ;
2. taux FX utilisé ;
3. source du taux ;
4. date/heure effective ;
5. méthode de conversion ;
6. montant converti ;
7. devise de présentation.

Le taux affiché pour la BI n’est pas nécessairement un taux transactionnel ; la distinction doit être explicite.

---

## 11. RBAC / ABAC

Rôles possibles :

- `BI_VIEWER` ;
- `BI_ANALYST` ;
- `BI_REPORT_BUILDER` ;
- `BI_DATA_STEWARD` ;
- `BI_FINANCE_VIEWER` ;
- `BI_RISK_VIEWER` ;
- `BI_COMPLIANCE_VIEWER` ;
- `BI_EXECUTIVE` ;
- `BI_AUDITOR` ;
- `BI_ADMIN` ;
- `SUPER_ADMIN`.

Attributs ABAC :

- organisation ;
- entité ;
- pays ;
- région ;
- équipe ;
- produit ;
- segment ;
- partenaire ;
- classification de données ;
- finalité ;
- environnement ;
- heure/session ;
- niveau de risque ;
- statut employé ;
- besoin d’en connaître.

Un rôle exécutif global n’implique pas automatiquement accès aux PII brutes.

Actions séparées : voir dashboard, créer dashboard, publier, exporter, planifier, partager, voir données détaillées, voir PII, voir données conformité, voir données risque, voir finance, administrer métriques, certifier métriques, administrer rétention.

---

## 12. Confidentialité et minimisation

- pseudonymiser les identifiants lorsque l’identité n’est pas nécessaire ;
- masquer téléphone, email, document KYC et coordonnées bancaires ;
- interdire PAN complet, CVV, PIN, secret d’authentification et credential partenaire dans la BI ;
- seuils d’agrégation configurables pour éviter les groupes trop petits ;
- protection contre l’export massif ;
- watermark ou marquage d’export sensible si requis ;
- expiration des liens d’export ;
- contrôle de finalité ;
- politiques de rétention par dataset ;
- droit d’accès/suppression appliqué selon cadre légal et obligations de conservation ;
- journalisation des consultations de données hautement sensibles.

---

## 13. Architecture analytique

Architecture cible découplée :

`Domain Events / CDC -> Ingestion -> Validation -> Raw/Staging sécurisé -> Modèles analytiques -> Couche sémantique -> API BI / Dashboards / Exports`

Principes :

- aucune requête BI lourde directement sur les bases transactionnelles en production ;
- ingestion idempotente ;
- déduplication par identifiant événement/version ;
- reprise après panne ;
- gestion des événements tardifs ;
- watermark de traitement ;
- lineage ;
- partitionnement temporel ;
- backfills contrôlés ;
- vues matérialisées pour KPI fréquents ;
- cache borné avec invalidation ;
- séparation workloads interactifs et exports lourds ;
- chiffrement en transit et au repos ;
- catalogage et classification des datasets.

Le choix concret de data warehouse, lakehouse, moteur OLAP ou fournisseur cloud reste abstrait/configurable et n’est pas présenté comme acquis sans décision d’architecture et contrat.

---

## 14. API

Exemples d’API internes/externes autorisées :

- `GET /bi/dashboards` ;
- `GET /bi/dashboards/:id` ;
- `POST /bi/dashboards` ;
- `PATCH /bi/dashboards/:id` ;
- `GET /bi/metrics` ;
- `GET /bi/metrics/:code` ;
- `POST /bi/reports/run` ;
- `GET /bi/reports/runs/:id` ;
- `POST /bi/reports/schedules` ;
- `PATCH /bi/reports/schedules/:id` ;
- `GET /bi/reports/runs/:id/download` ;
- `POST /bi/query` avec DSL borné ;
- `GET /bi/data-quality` ;
- `GET /bi/pricing/analytics` ;
- `GET /bi/reconciliation/summary`.

Exigences : OAuth/service identity ou JWT approprié, RBAC/ABAC, rate limiting, pagination, limites de plage temporelle, idempotency key pour créations, corrélation, audit et masquage des champs.

Les API publiques n’exposent que les métriques explicitement autorisées dans le module API publiques & Portail développeurs.

---

## 15. Webhooks et événements

Événements possibles :

- `report.run.started` ;
- `report.run.completed` ;
- `report.run.failed` ;
- `report.schedule.failed` ;
- `metric.definition.published` ;
- `metric.definition.deprecated` ;
- `data.quality.warning` ;
- `data.quality.failed` ;
- `dataset.freshness.degraded` ;
- `pricing.analytics.anomaly.detected` ;
- `reconciliation.analytics.mismatch` ;
- `export.ready` ;
- `export.expired`.

Les webhooks utilisent signature, timestamp, anti-rejeu, identifiant d’événement, retries bornés, dead-letter queue et idempotence côté consommateur.

---

## 16. Exports et livraisons programmées

Formats : CSV, XLSX, PDF et JSON selon cas. Aucun format n’est obligatoire si les données ne sont pas adaptées.

Règles :

- génération asynchrone pour gros volumes ;
- durée de vie limitée ;
- stockage chiffré ;
- URL signée courte durée ;
- quotas ;
- taille maximale ;
- audit du demandeur et téléchargement ;
- masquage selon rôle ;
- pas d’envoi email de pièce sensible en clair ;
- possibilité de dépôt via intégration abstraite sécurisée ;
- checksum et métadonnées de génération ;
- reproductibilité via version du rapport et `dataCutoffAt`.

---

## 17. Feature flags

Flags minimum :

- `bi.enabled` ;
- `bi.executiveDashboard.enabled` ;
- `bi.financialReporting.enabled` ;
- `bi.customReports.enabled` ;
- `bi.exports.enabled` ;
- `bi.scheduledReports.enabled` ;
- `bi.realtimeMetrics.enabled` ;
- `bi.partnerPortalMetrics.enabled` ;
- `bi.enterpriseMetrics.enabled` ;
- `bi.publicSectorMetrics.enabled` ;
- `bi.riskMetrics.enabled` ;
- `bi.pricingAnalytics.enabled` ;
- `bi.dataQuality.enabled`.

Scopes : environnement, pays, entité, organisation, segment et rôle. Les flags ne contournent jamais la conformité locale.

---

## 18. Administration

Console d’administration :

- catalogue métriques/dimensions ;
- certification et versioning ;
- dashboards système ;
- rapports standard ;
- rapports personnalisés ;
- politiques d’export ;
- programmations ;
- quotas ;
- scopes d’accès ;
- classifications ;
- rétention ;
- qualité des données ;
- fraîcheur ;
- lineage ;
- backfills ;
- incidents d’ingestion ;
- suivi de coûts techniques ;
- politiques FX d’affichage ;
- mapping pricing ;
- audit.

Les changements sensibles de définition financière, métrique réglementaire, accès PII, rétention ou portée globale nécessitent maker-checker si configuré.

---

## 19. Audit immuable

Auditer au minimum :

- création/modification/publication d’une métrique ;
- modification d’une formule ;
- certification/dépréciation ;
- création/partage d’un dashboard ;
- exécution rapport ;
- export ;
- téléchargement ;
- programmation ;
- modification destinataires ;
- consultation de données sensibles ;
- changement RBAC/ABAC ;
- backfill ;
- correction de dataset ;
- changement de politique FX ;
- modification d’un mapping tarifaire ;
- changement rétention ;
- acquittement d’une alerte qualité.

Chaque entrée contient acteur, action, objet, avant/après lorsque pertinent, timestamp, corrélation, justification, environnement et résultat.

---

## 20. Qualité des données

Contrôles minimum :

- unicité ;
- complétude ;
- fraîcheur ;
- validité de schéma ;
- référentialité ;
- cohérence montants/devises ;
- somme des composantes tarifaires ;
- présence du `PricingSnapshot` lorsque requis ;
- cohérence transaction vs règlement ;
- cohérence compteurs ;
- duplication événement ;
- volumes anormaux ;
- rupture de série ;
- retard ingestion ;
- orphelins ;
- taux de null inhabituel.

Les échecs critiques peuvent bloquer publication d’un rapport certifié sans bloquer les transactions métier.

---

## 21. Alertes analytiques

Permettre des alertes configurables sur métriques certifiées :

- seuil absolu ;
- variation relative ;
- rupture statistique simple ;
- absence de données ;
- retard ;
- dépassement budget ;
- hausse erreurs ;
- baisse taux de succès ;
- anomalie de marge ;
- concentration ;
- divergence de rapprochement ;
- dérive de frais/commissions.

Une alerte BI ne doit pas être présentée comme une preuve de fraude ; elle déclenche revue ou workflow du domaine compétent.

---

## 22. Cas réseau faible / hors ligne

Pour utilisateurs terrain autorisés :

- derniers dashboards légers mis en cache ;
- affichage explicite de la date de dernière synchronisation ;
- aucun chiffre périmé présenté comme temps réel ;
- rapports pré-téléchargés chiffrés ;
- interdiction d’export sensible hors ligne par défaut ;
- resynchronisation incrémentale ;
- limitation des datasets ;
- révocation d’accès lors du retour réseau ;
- effacement local selon politique.

La BI complète reste prioritairement en ligne ; aucune opération financière n’est déclenchée par un dashboard hors ligne.

---

## 23. Intégrations partenaires abstraites

Adaptateurs possibles :

- banque ;
- Mobile Money ;
- processeur paiement ;
- assurance ;
- crédit ;
- investissement ;
- crypto ;
- téléphonie ;
- administration ;
- CRM ;
- comptabilité ;
- ERP ;
- data warehouse/BI externe ;
- stockage sécurisé ;
- observabilité.

Chaque adaptateur possède environnement, capacités, mapping, schéma de données, fréquence, SLA, état de santé, provenance, version et politique d’erreur.

Aucune intégration n’est indiquée comme disponible sans contrat, autorisation et configuration réels.

---

## 24. Sécurité

- chiffrement TLS ;
- chiffrement au repos ;
- gestionnaire de secrets externe ;
- sessions courtes pour actions sensibles ;
- MFA selon rôle ;
- least privilege ;
- isolation tenant ;
- row-level/column-level security ou équivalent ;
- rate limiting ;
- protection injection ;
- validation DSL ;
- CSP et protections web ;
- antivirus/scanning pour fichiers importés ;
- limitation exports ;
- détection accès anormaux ;
- rotation credentials ;
- sauvegardes chiffrées ;
- tests restauration ;
- plan d’incident ;
- traçabilité admin.

---

## 25. Performance et résilience

Cibles initiales à valider par charge réelle :

- dashboard standard pré-agrégé : p95 < 2 s ;
- requête interactive bornée : p95 < 5 s ;
- aucune requête analytique ne doit ralentir le chemin transactionnel ;
- ingestion événement standard : retard cible inférieur à quelques minutes pour quasi temps réel ;
- KPI réellement temps réel réservés aux cas justifiés ;
- exports lourds asynchrones ;
- retry avec backoff ;
- DLQ ;
- circuit breaker pour sources externes ;
- reprise de checkpoint ;
- RPO/RTO documentés selon criticité ;
- capacité de backfill sans saturation du trafic normal ;
- partitionnement, indexation et archivage testés.

---

## 26. Observabilité

Métriques techniques :

- événements ingérés/s ;
- lag ingestion ;
- échecs transformation ;
- files d’attente ;
- temps requête ;
- hit ratio cache ;
- exports en cours ;
- taux d’échec rapports ;
- fraîcheur datasets ;
- coûts par workload ;
- backfills ;
- DLQ ;
- erreurs permission ;
- tentatives export interdites.

Traces avec correlation IDs de la source au rapport lorsque possible.

---

## 27. Tests fonctionnels

Scénarios minimum :

1. ouvrir un dashboard avec bon scope ;
2. vérifier qu’un autre tenant est inaccessible ;
3. filtrer pays/devise/période ;
4. comparer deux périodes ;
5. exécuter rapport standard ;
6. créer rapport personnalisé avec métriques autorisées ;
7. refuser dimension interdite ;
8. exporter CSV/XLSX/PDF ;
9. expiration export ;
10. programmer rapport ;
11. échec de programmation et reprise ;
12. versionner une métrique ;
13. reproduire un ancien rapport avec ancienne version ;
14. événement tardif ;
15. transaction remboursée ;
16. conversion FX ;
17. pricing snapshot ancien après changement tarifaire ;
18. promotion ;
19. commission multi-bénéficiaire ;
20. anomalie de qualité ;
21. données retardées ;
22. backfill contrôlé ;
23. cache hors ligne avec date visible ;
24. révocation permission ;
25. audit de consultation sensible.

---

## 28. Tests sécurité

- IDOR tenant/pays/entité ;
- élévation de privilège ;
- accès champ PII sans permission ;
- export massif ;
- injection dans filtres/DSL ;
- formule malveillante ;
- liens d’export expirés ;
- rejeu webhook ;
- vol token ;
- absence MFA sur rôle sensible ;
- contournement row-level security ;
- fuite via logs ;
- cache partagé entre tenants ;
- CSV injection à l’export ;
- fichier importé malveillant ;
- abus de pagination ;
- DoS via requête coûteuse.

---

## 29. Tests performance et résilience

- forte concurrence dashboards ;
- rafraîchissement simultané ;
- export millions de lignes selon limites ;
- montée en charge ingestion ;
- duplication d’événements ;
- panne source ;
- panne warehouse/OLAP ;
- retard réseau ;
- DLQ ;
- redémarrage worker ;
- backfill historique ;
- changement de schéma ;
- failover ;
- restauration sauvegarde ;
- saturation cache ;
- partenaire lent ;
- cohérence après reprise.

---

## 30. Ordre de développement recommandé

### Phase 1 — Fondations

- catalogue métriques/dimensions ;
- contrats d’événements ;
- ingestion idempotente ;
- modèle analytique transaction ;
- lineage ;
- RBAC/ABAC ;
- audit ;
- qualité des données.

### Phase 2 — Finance et pricing

- `PricingSnapshot` analytics ;
- frais/commissions/taxes ;
- revenus ;
- règlements ;
- rapprochement ;
- multi-devises ;
- FX snapshots.

### Phase 3 — Dashboards cœur

- exécutif ;
- opérations ;
- produit ;
- commerçants ;
- agents ;
- partenaires ;
- entreprises.

### Phase 4 — Rapports et exports

- rapports standards ;
- moteur d’exécution ;
- exports ;
- programmation ;
- notifications ;
- sécurité téléchargement.

### Phase 5 — Constructeur analytique

- couche sémantique ;
- DSL borné ;
- dashboards personnalisés ;
- métriques certifiées ;
- gouvernance.

### Phase 6 — Risque, conformité et État

- vues spécialisées ;
- permissions renforcées ;
- rapports figés ;
- rétention locale ;
- audit dédié.

### Phase 7 — Optimisation

- quasi temps réel ;
- caches ;
- pré-agrégations ;
- alertes ;
- observabilité ;
- tests charge ;
- reprise catastrophe.

---

## 31. Critères d’acceptation

Le module est acceptable lorsque :

- les KPI critiques possèdent une définition versionnée et certifiable ;
- aucune BI lourde n’interroge directement le chemin transactionnel critique ;
- les accès respectent tenant, pays, entité, rôle et attributs ;
- les données PII sont minimisées et masquées ;
- les dashboards affichent leur fraîcheur ;
- les montants historiques utilisent les frais, commissions et taxes réellement appliqués ;
- chaque transaction tarifée peut être reliée à son `PricingSnapshot` ;
- les conversions FX sont explicites et reproductibles ;
- les rapports publiés conservent définition, paramètres et cutoff ;
- les exports sont sécurisés, expirables et audités ;
- les métriques financières ne changent pas silencieusement après publication ;
- les contrôles qualité détectent absence, retard, incohérence et duplication ;
- les rapports multi-pays et multi-devises sont cohérents ;
- la panne BI ne bloque pas les opérations financières ;
- les webhooks sont signés, idempotents et rejouables proprement ;
- les tests fonctionnels, sécurité, performance et résilience sont automatisés ;
- aucun secret ou identifiant partenaire réel n’est commité ;
- toute intégration externe demeure abstraite jusqu’à disponibilité contractuelle réelle ;
- le module est prêt à alimenter le futur **Pricing & Commission Engine central** du module 20 pour la réconciliation finale des règles de tarification.

---

## 32. Dépendances

- ledger/transactions ;
- utilisateurs/KYC/KYB ;
- commerçants/agents ;
- entreprises ;
- partenaires ;
- modules État ;
- fraude/risque ;
- conformité ;
- change/multi-devises ;
- moteur de frais et commissions ;
- rapprochement ;
- API publiques ;
- notifications ;
- audit ;
- feature flags ;
- observabilité.

Ces dépendances sont contractuelles/logiques. Leur présence dans ce document ne signifie pas qu’un fournisseur externe ou qu’une capacité réglementée est disponible en production.
