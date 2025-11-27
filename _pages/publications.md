---
layout: default
title: Publications
---

<a href="http://scholar.google.be/citations?user=5sYmY3EAAAAJ" target="_blank"><img border="0" src="img/scholar.gif" alt="Scholar" width="130"></a> <br>
<a href="http://dblp.dagstuhl.de/pers/hd/s/Schaus:Pierre" target="_blank"><img border="0" src="img/dblp.png" alt="DBLP" width="130"></a> <br>

{% for category in site.data.publications %}
  <h4>{{ category.year }}</h4>
  <ul>
  {% for pub in category.papers %}
    <li>
      {{ pub.authors }}. <a href="{{ pub.link }}">{{ pub.title }}</a>.
      {% if pub.venue %}{{ pub.venue }}.{% endif %}
      {% if pub.code %}<a href="{{ pub.code }}">code</a>{% endif %}
    </li>
  {% endfor %}
  </ul>
{% endfor %}