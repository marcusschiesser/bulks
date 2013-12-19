<?php
	namespace Bulks;
	interface Action {
		/**
	     * @param array $args
	     * @return Result */
	    public function execute($args);
	}
?>