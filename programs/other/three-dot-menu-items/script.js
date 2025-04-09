$(window).on("add-dropdown-menu-items", (event, data) => {
  const menuItems = data.new_menu_items
  let tries = 0
  let navigation, menu

  const interval = setInterval(() => {
    if (tries > 300) {
      // Give up!
      clearInterval(interval)
      return
    }

    navigation = document.querySelector("#program_navigation")

    if (!navigation) {
      return
    }

    menu = navigation.querySelector(".dropdown-menu")

    if (!menu) {
      tries++
      return
    }

    clearInterval(interval)

    if (!menuItems || menuItems.length === 0) {
      tries++
      return
    }

    menuItems.forEach(item => {
      const shouldOpenInNewTab = item.new_tab === 1
      const li = document.createElement("li")
      li.classList.add("new-dropdown-menu-item")
      li.role = "menuitem"

      const a = document.createElement("a")
      a.href = item.url

      if (shouldOpenInNewTab) {
        a.target = "_blank"
        a.rel = "noopener noreferrer"
      }

      const icon = document.createElement("span")

      if (item.icon.includes("glyphicon")) {
        icon.classList.add("glyphicon")
        icon.classList.add(item.icon)
      } else if (item.icon.startsWith("fa-")) {
        icon.classList.add("fa")
        icon.classList.add(item.icon)
      } else {
        icon.classList.add("emoji")
        icon.innerHTML = item.icon
      }

      const label = document.createElement("span")
      label.innerHTML = item.label
      label.classList.add("text")

      a.appendChild(icon)
      a.appendChild(label)

      if (shouldOpenInNewTab) {
        const externalIcon = document.createElement("span")
        externalIcon.classList.add("glyphicon")
        externalIcon.classList.add("glyphicon-new-window")
        label.appendChild(externalIcon)
      }

      li.appendChild(a)
      menu.appendChild(li)

      // The following bit just copies the new menu item elements, makes
      // them invisible, and adds them to the DOM far offscreen. This
      // should hopefully force the icons to load before the first time
      // the dropdown menu is used.

      const deep = true
      const icon2 = icon.cloneNode(deep)
      icon2.style.opacity = 0
      icon2.style.position = "fixed"
      icon2.style.left = "-99999px"
      icon2.style.top = "-99999px"
      icon2.style.pointerEvents = "none"
      document.body.appendChild(icon2)

      setTimeout(() => {
        try {
          document.body.removeChild(icon2)
        } catch (e) {}
      }, 3000)
    })
  }, 100)
})
