---
layout: post
title: Learning Probability
date: 2026-09-23
description: notes and experiments, while i am learning probability the right way.
tags: [Math, Machine Learning, Probability]
---
# Probability the right way

### Sample Space, S

A Sample Space is the set of all possible outcomes of an experiment[^sample-space]. For Example:

- coin flip: S = {Heads, Tails}
- Flipping two coins:  S = {(H, H), (H, T), (T, T), (T, H)}
- Roll of 6-sided die:  = {1, 2, 3, 4, 5, 6}
- The number of emails you receive in a day: $S = \\{x \mid x \in \mathbb{Z}, x \geq 0\\}$

### Event, E

An Event is some subset of $S$ that we ascribe meaning to[^event]. $E \subseteq S$ in set notation.

- coin flip is heads: E = {Heads}
- At least 1 head on 2 coin flips = {(H, H), (H, T), (T, H)}
- Roll of die is 3 or less: E = {1, 2, 3}

Events can be represented as capital letters such as $E$ or $F$ .

---

## Probability, P(E) or Pr(E) : True Probability

A number between 0 and 1.

$$P(E)$$: probability of event $$(E)$$ occurring.

**The ratio of the number of trials in which the event occurs, $$count(Event)$$, to the total number of trials performed, $n$. As the number of trials approaches infinity, this ratio converges to the true probability of the event.**

$$P(\text{Event}) 
  = \lim_{n \rightarrow \infty}
    \frac
        {\text{count}(\text{Event})}
        {n}$$

### Axioms of Probability

**Axiom 1**: $0 ≤ P(E) ≤ 1$        -> All probabilities are numbers between 0 and 1.

**Axiom 2**: $P(S) = 1$            -> All outcomes must be from the [Sample Space](#sample-space-s).

**Axiom 3**: if $E$ and $F$ are mutually exclusive, then $P(E \text{ or } F) = P(E) + P(F)$ -> The probability of "or" for mutually exclusive events


[^sample-space]: Intuition — $S$ must be exhaustive and mutually exclusive. Example: $S = \\{x \mid x \in \mathbb{R}, 0 \leq x \leq 24\\}$ for hours in a day.
[^event]: Any $E \subseteq S$ is an event, including the empty set and $S$ itself.

These three axioms are formally called the [Kolmogorov axioms](https://en.wikipedia.org/wiki/Probability_axioms).


## Equally Likely Outcomes

