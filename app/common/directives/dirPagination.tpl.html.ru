<ul class="pagination" ng-if="1 < pages.length || !autoHide">
    <li ng-if="boundaryLinks" ng-class="{ disabled : pagination.current == 1 }">
        <a href="" ng-click="setCurrent(1)">{{ dataService.language == 'ru' ? 'Первая':'First' }}</a>
    </li>
    <li ng-if="directionLinks" ng-class="{ disabled : pagination.current == 1 }">
        <a href="" ng-click="setCurrent(pagination.current - 1)">{{ dataService.language == 'ru' ? 'Предыдущая':'Previous' }}</a>
    </li>
    <li ng-repeat="pageNumber in pages track by tracker(pageNumber, $index)" ng-class="{ active : pagination.current == pageNumber, disabled : pageNumber == '...' }">
        <a href="" ng-click="setCurrent(pageNumber)">{{ pageNumber }}</a>
    </li>

    <li ng-if="directionLinks" ng-class="{ disabled : pagination.current == pagination.last }">
        <a href="" ng-click="setCurrent(pagination.current + 1)">{{ dataService.language == 'ru' ? 'Следующая':'Next' }}</a>
    </li>
    <li ng-if="boundaryLinks"  ng-class="{ disabled : pagination.current == pagination.last }">
        <a href="" ng-click="setCurrent(pagination.last)">{{ dataService.language == 'ru' ? 'Последняя':'Last' }}</a>
    </li>
</ul>