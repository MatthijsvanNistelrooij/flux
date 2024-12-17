exportconst formattedDate = post
? new Date(post.$createdAt).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
: ""