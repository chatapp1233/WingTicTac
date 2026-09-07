package com.chatapp.backend.mapper;

/** Generic entity &lt;-&gt; DTO conversion contract implemented by each domain mapper. */
public interface Mapper<E, D> {
    D toDto(E entity);
}
