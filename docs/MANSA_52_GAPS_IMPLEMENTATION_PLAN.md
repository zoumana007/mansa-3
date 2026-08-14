# MANSA — Plan d’implémentation des 52 briques manquantes

Ce document sert de référence de travail pour compléter progressivement le projet MANSA sans retirer les fonctionnalités existantes ni décider du MVP à la place du propriétaire du projet.

## Règles d’exécution

- Ne pas supprimer ni réduire une fonctionnalité MANSA existante sans nécessité technique démontrée.
- Respecter l’architecture et les conventions déjà présentes dans le dépôt.
- Avant chaque modification, inspecter le code existant afin d’éviter les doublons.
- Implémenter les briques de manière modulaire, testable et réutilisable.
- Ajouter ou adapter les migrations, modèles, services, API, validations, tests et documentation nécessaires.
- Ne jamais committer de secrets, clés API, mots de passe ou données sensibles.
- Chaque lot doit laisser le dépôt dans un état cohérent et, autant que possible, compilable/testable.
- Les fonctionnalités doivent être configurables lorsqu’elles dépendent d’un pays, d’un partenaire, d’un niveau KYC, d’un type d’utilisateur ou d’une politique MANSA.

## Les 52 points à compléter

1. Ledger financier en partie double.
2. Rapprochement financier automatique.
3. Moteur de risque et fraude.
4. Gestion complète des statuts de transaction.
5. Gestion des erreurs et reprises automatiques.
6. Idempotence des paiements.
7. Gestion de la liquidité des agents.
8. Back-office opérationnel avancé.
9. Double validation pour les opérations sensibles.
10. Moteur de frais et commissions.
11. Calcul de rentabilité par transaction.
12. Gestion avancée des plafonds.
13. Gestion des litiges et chargebacks.
14. Gestion des réserves commerçants.
15. Gestion des règlements commerçants.
16. Gestion des suspensions et gels de fonds.
17. Recovery de compte sécurisé.
18. Gestion multi-appareils et sessions.
19. Device fingerprinting.
20. Centre de consentement.
21. Gestion de la conservation des données.
22. Export des données utilisateur et suppression lorsque juridiquement possible.
23. Audit logs immuables.
24. Gestion avancée des rôles et permissions.
25. Gestion des secrets et clés cryptographiques.
26. HSM/KMS pour les éléments sensibles lorsque nécessaire.
27. Monitoring et observabilité.
28. Alertes automatiques d’incident.
29. Disaster Recovery.
30. Business Continuity Plan.
31. Feature flags.
32. Configuration par pays.
33. Gestion centralisée des fournisseurs.
34. Failover fournisseur.
35. Sandbox partenaires.
36. Portail API / développeurs.
37. Gestion des webhooks clients.
38. Versioning des API.
39. Centre de notifications multicanal.
40. Gestion des modèles de notification par langue et pays.
41. Support client structuré.
42. Gestion des réclamations réglementaires.
43. Gestion des bénéficiaires enregistrés et listes de confiance.
44. Gestion des héritiers / succession / titulaire décédé selon les règles applicables.
45. Gestion des comptes mineurs ou sous contrôle si MANSA les autorise.
46. Détection des comptes dormants et règles associées.
47. Reporting financier interne.
48. Reporting conformité.
49. Reporting partenaires.
50. Moteur de règles configurable.
51. Gestion des versions des CGU et politiques avec preuve d’acceptation.
52. Architecture claire des responsabilités entre MANSA, banque partenaire, Mobile Money, réseaux cartes et autres prestataires.

## Méthode de suivi

À chaque session de travail :

1. Lire ce fichier et l’état actuel du dépôt.
2. Identifier les points déjà totalement ou partiellement couverts.
3. Choisir un lot cohérent de points encore manquants.
4. Implémenter le lot sans casser les modules existants.
5. Ajouter/mettre à jour les tests.
6. Exécuter les validations disponibles (lint, typecheck, tests, build selon le projet).
7. Corriger les régressions directement liées aux changements.
8. Mettre à jour ce document avec un journal succinct de ce qui a été réellement implémenté.
9. Committer et pousser les changements sur le dépôt.

## Journal d’avancement

- 2026-08-14 : plan initial des 52 points ajouté au dépôt.
