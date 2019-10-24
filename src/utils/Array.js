/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Sorts mentors by slots (those with slots are first and those with no slots come second)
 * @param {Array} mentors
 */
export function sortMentorsBySlots(mentors) {
  let orderedMentors = mentors.filter(mentor => mentor.slots.length)
  let mentorsWithNoSlots = mentors.filter(mentor => mentor.slots.length === 0)

  // for(let mentor of mentorsWithNoSlots) orderedMentors.push(mentor)

  orderedMentors = [...orderedMentors, ...mentorsWithNoSlots]

  return orderedMentors
}
