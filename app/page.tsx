"use client";
import { useState, useEffect } from "react";

type Prompt = { t:string; d:string; tip:string };
const WEEKLY_PROMPTS: Record<number, Prompt[]> = {
0: [{t:"First Hours: Hello World", d:"Skin-to-skin, hospital bracelet, footprints", tip:"Window light only, no flash"}, {t:"Name Story", d:"Why you chose their name, meaning, nicknames", tip:"Include birth stats card"}],
1: [{t:"Homecoming", d:"The outfit, car seat, front door moment", tip:"Get siblings/pets reaction"}, {t:"Midnight Feeds", d:"2am reality - lamp light, cozy, tired perfect", tip:"Underexposed is beautiful"}],
2: [{t:"Tiny Details", d:"Fingers, toes, ear curls, belly button, hair swirl", tip:"Macro mode, same hand for scale"}, {t:"Sleepy Portrait", d:"Milk-drunk, yawns, stretches", tip:"White noise, warm room"}],
3: [{t:"First Bath", d:"Sponge bath reactions, tiny tub", tip:"Have towel ready, capture face"}, {t:"Visitors & First Cuddles", d:"Grandparents, friends meeting", tip:"Hands holding baby"}],
4: [{t:"One Month Old", d:"Same blanket for monthly comparison, growth", tip:"Use same outfit/spot each month"}, {t:"Favorite Swaddle & Sleep Spot", d:"Where they love to sleep, swaddle style", tip:"Overhead shot"}],
5: [{t:"Eye Contact & Awake Windows", d:"Those first locked gazes, longer awake time", tip:"Get down on their level"}, {t:"Bath Ritual", d:"Your routine, lotion, massage", tip:"Capture your hands"}],
6: [{t:"Social Smile Watch", d:"Are we there yet? The gummy smile", tip:"Morning light after nap"}, {t:"Tummy Time Strength", d:"Neck control, mini push-ups", tip:"Mirror in front helps"}],
7: [{t:"Cooing Conversations", d:"Oohs, aahs, mouth wide open talking", tip:"Video + photo, record sound"}, {t:"Bedtime Routine", d:"Bath, book, song, sleep sack", tip:"Document the steps"}],
8: [{t:"Two Months", d:"Milestone photo, growth check", tip:"Same setup as 1 month"}, {t:"Hands Together & Discovery", d:"Hands at midline, batting at toys", tip:"Play gym from above"}],
9: [{t:"Tracking You", d:"Following you with eyes, turning to voice", tip:"Move slowly side to side"}, {t:"Morning Light Stretch", d:"Wake up stretch, morning crib", tip:"Crib from above"}],
10: [{t:"Head Control", d:"Steady head, looking around in carrier", tip:"Carrier walk photo"}, {t:"First Outing - Fresh Air", d:"Park, coffee shop, first walk", tip:"Include stroller/wrap"}],
11: [{t:"Grasp & Hold", d:"Holding your finger, toy, your hair", tip:"Focus on connection point"}, {t:"Water Play", d:"Kicking in bath, splash mat", tip:"Fast shutter"}],
12: [{t:"Three Months", d:"Big growth, new personality emerging", tip:"Monthly comparison"}, {t:"First Real Laugh", d:"Giggle, belly laugh", tip:"Tickle feet, peekaboo"}],
13: [{t:"Rolling Prep", d:"Side-lying, reaching across body", tip:"Toy just out of reach"}, {t:"Reading Together", d:"First books, your lap", tip:"Capture their gaze"}],
14: [{t:"Drool & Chew", d:"Hands in mouth, teething, bibs", tip:"Keep cloth handy"}, {t:"Mirror Play", d:"Talking to self in mirror", tip:"Floor mirror"}],
15: [{t:"Reaching & Grabbing", d:"Purposeful reach, pulling to mouth", tip:"Offer at chest level"}, {t:"Mom/Dad & Me", d:"You two, close up", tip:"Use timer or partner"}],
