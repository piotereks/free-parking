I have react web app in project.
I want to convert it to mobile (android/ios) project.
I want  Option — Two completely separate repos (Web + Mobile).
This is because monorepo is really not efficient because of cryptic dependency with annything.
What my repo would like
repo-web/        ← React Web
repo-mobile/     ← React Native (iOS + Android)
shared/          ← optional npm package or git submodule for core logic (I suppose clean javascript, not intoxitcated with reactivity :) )

I want you draw prompt for Github copilot to prepare plan of conversion.
Phase 1) reposition existing web repo with configs (.github workflows need to be considered)
- I need that in iterations
Phaser 2) for mobile app we focus on iterative delivery (MVP). 
  - creating default expo project, 
 - creating minimal function
- then step, by step.

regarding shared/ construction - would be the best to create that in Phase 1.

please create such prompt for github copilot.