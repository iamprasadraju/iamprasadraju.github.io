---
layout: post
title: Learning Probability
date: 2026-09-23
description: notes and experiments, while i am learning probability the right way.
tags: [Math, Machine Learning, Probability]
---
<style>
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
}

th {
  font-weight: 600;
}
</style>

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

**Axiom 1**: $0 ≤ P(E) ≤ 1$        → All probabilities are numbers between 0 and 1.

**Axiom 2**: $P(S) = 1$            → All outcomes must be from the [Sample Space](#sample-space-s).

**Axiom 3**: if $E$ and $F$ are mutually exclusive, then $P(E \text{ or } F) = P(E) + P(F)$ → The probability of "or" for mutually exclusive events

These three axioms are formally called the [Kolmogorov axioms](https://en.wikipedia.org/wiki/Probability_axioms).

## Equally Likely Outcomes

**Equally likely outcomes are outcomes that have the same chance (probability) of happening. (In a sample space)**

For example, when you toss a fair coin:
- Head → probability = 1/2
- Tail → probability = 1/2

Since both have the same probability, Head and Tail are equally likely outcomes.

**Definition:** Probability of Equally Likely Outcomes

probability of the [sample space](#sample-space-s) must be 1.

**If $S$ is a sample space with equally likely outcomes, for an event $E$ that is a subset of the outcomes in $S$:**

$$ \begin{align}
P(E) &= \frac{\text{number of outcomes in $E$}}{\text{number of outcomes in $S$}} 
= \frac{|E|}{|S|}
\end{align}$$

Example for Not equally likely outcomes: A bag of balls, Biased coin

- Suppose a bag contains:
  - 8 red balls
  - 2 blue balls

 If you randomly pick one: $P(red) = 0.8$, $P(blue) = 0.2$

- Biased coin: Suppose a coin is designed so that:
  - Heads → 70% chance
  - Tails → 30% chance
They are not equally likely because:$P(H) \ne P(T)$

---

# Probability of or 

source[^reference]

Calculating the probability of either event $E$ or event $F$ happening, written $P(E \text{ or } F)$ or equivalently as $P(E \cup F)$.

### Mutually exclusive events

**Two events: $E$, $F$ are considered to be mutually exclusive (in set notation $E ∩ F = ∅$) if there are no outcomes that are in both events.**

<div  align="center">
    <img src="https://chrispiech.github.io/probabilityForComputerScientists/img/probOr/mutuallyExclusive.png" width="40%">
</div>

<br>

**If two events: ,  are mutually exclusive then the probability of  or  occurring is:**

$$ P(E \text{ or }  F) = P(E) + P(F)$$

For n mutually exclusive events:

$$ P(E_1 \text{ or } E_2 \text{ or } \dots \text{ or } E_n) = P(E_1) + P(E_2) + \dots + P(E_n) = \sum_{i=1}^n P(E_i)$$


# Probability of and
source[^source2]

# Conditional Probability
source[^source3]

In English, a conditional probability states "what is the chance of an event $E$ happening given that I have already observed some other event $F$ ". It is a critical idea in machine learning and probability.

<div  align="center">
    <img src="https://chrispiech.github.io/probabilityForComputerScientists/img/chapters/conditionalProbability.png" width="40%">
</div>
<br>
**The probability of E given that (aka conditioned on) event F already happened:**

$$P(E |F) = \frac{P(E \text { and } F)}{P(F)}$$


**Written as:** $P(E \mid F)$ \
**Means:** "P(E, given F already observed)"

<br>
#### Notations

| Meaning | Common notation | Also seen | Description |
|:---|:---|:---|:---|
| **AND** | $P(E \cap F)$ | $P(E,F)$, $P(EF)$, $P(E \text{ and } F)$ | Probability that **both** $E$ and $F$ occur |
| **OR** | $P(E \cup F)$ | $P(E+F)$, $P(E \text{ or } F)$ | Probability that **at least one** of $E,F$ occurs |
| **Condition** | $P(E \mid F)$ | $P(E\mid F)$, $P(E\text{ given }F)$ | Probability of $E$, **given that** $F$ occurred |

[^sample-space]: Intuition — $S$ must be exhaustive and mutually exclusive. Example: $S = \\{x \mid x \in \mathbb{R}, 0 \leq x \leq 24\\}$ for hours in a day.
[^event]: Any $E \subseteq S$ is an event, including the empty set and $S$ itself.
[^reference]: [Probability of or](https://chrispiech.github.io/probabilityForComputerScientists/en/part1/prob_or/)
[^source2]: [Probability of and](https://chrispiech.github.io/probabilityForComputerScientists/en/part1/prob_and/)
[^source3]: [Conditional Probability](https://chrispiech.github.io/probabilityForComputerScientists/en/part1/cond_prob/)