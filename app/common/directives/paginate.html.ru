<nav aria-label="{{ dataService.language == 'ru' ? 'страницы':'pagination' }}">
    <ul class="pagination" role="menubar">
        <li><a href=""><span>{{ dataService.language == 'ru' ? 'Первая':'First' }}</span></a></li>
        <li><a href=""><span>{{ dataService.language == 'ru' ? 'Предыдущая':'Previous' }}</span></a></li>
        <li><a href="">1</a></li>
        <li><a href="">2</a></li>
        <li><a href="">3</a></li>
        <li class="current"><a href="">4</a></li>
        <li><a href="">5</a></li>
        <li><a href="">6</a></li>
        <li><a href="">7</a></li>
        <li><a href="">8</a></li>
        <li><a href="">9</a></li>
        <li><a href="">10</a></li>
        <li><a href=""><span>{{ dataService.language == 'ru' ? 'Следующая':'Next' }}</span></a></li>
        <li><a href=""><span>{{ dataService.language == 'ru' ? 'Последняя':'Last' }}</span></a></li>
    </ul>
</nav>